const path = require('path');
const express = require('express');
const database = require('./database');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const cors = require('cors');

// Security utilities
function sanitizeInput(input) {
  return String(input || '')
    .replace(/[<>]/g, '')
    .trim()
    .substring(0, 500);
}

const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disable CSP for now to fix API issues
}));

// CORS middleware
app.use(cors({
  origin: true, // Allow all origins for now
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);
app.use(express.json({ limit: '10mb' })); // Limit request body size

// Middleware to log requests
app.use((req, res, next) => {
  console.log(`📡 ${req.method} ${req.path}`);
  next();
});

// Serve static files (frontend)
app.use(express.static(path.join(__dirname, '..')));

// ===== AUTH ENDPOINTS =====

// Clean API routes (without .php extension)
app.post('/backend/auth_register', async (req, res) => {
  try {
    const { name, email, password, role, phone, education, skills, experience, company } = req.body;
    
    // Validate required fields
    if (!name || !email || !password || !role) {
      return res.status(400).json({ 
        ok: false, 
        message: 'Name, email, password, and role are required' 
      });
    }

    // Check if user already exists
    const existingUser = await database.findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ 
        ok: false, 
        message: 'User with this email already exists' 
      });
    }

    // Create new user
    const newUser = await database.createUser({
      name: sanitizeInput(name),
      email: sanitizeInput(email),
      password: password, // Will be hashed in database.js
      role: sanitizeInput(role),
      phone: phone ? sanitizeInput(phone) : '',
      education: education ? sanitizeInput(education) : '',
      skills: skills ? sanitizeInput(skills) : '',
      experience: experience ? sanitizeInput(experience) : '',
      company: company ? sanitizeInput(company) : ''
    });
    
    res.json({ 
      ok: true, 
      message: 'User registered successfully',
      user: newUser
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ 
      ok: false, 
      message: 'Failed to register user' 
    });
  }
});

// Login user
app.post('/backend/auth_login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ 
        ok: false, 
        message: 'Email and password are required' 
      });
    }

    // Find user by email
    const user = await database.findUserByEmail(sanitizeInput(email));
    if (!user) {
      return res.status(401).json({ 
        ok: false, 
        message: 'Invalid email or password' 
      });
    }

    // Verify password
    const isValidPassword = await database.verifyPassword(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ 
        ok: false, 
        message: 'Invalid email or password' 
      });
    }

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;
    
    res.json({ 
      ok: true, 
      message: 'Login successful',
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      ok: false, 
      message: 'Failed to login' 
    });
  }
});

// ===== JOB ENDPOINTS =====

// Get all jobs with filters
app.get('/backend/jobs_list', async (req, res) => {
  try {
    const { q, location, education, category, created_by } = req.query;
    
    const filters = {};
    if (q) filters.q = q;
    if (location) filters.location = location;
    if (education) filters.education = education;
    if (category) filters.category = category;
    if (created_by) filters.created_by = created_by;

    const jobs = await database.getJobs(filters);
    
    res.json({ ok: true, jobs });
  } catch (error) {
    console.error('Get jobs error:', error);
    res.status(500).json({ 
      ok: false, 
      message: 'Failed to fetch jobs' 
    });
  }
});

// Get single job
app.get('/backend/job_get', async (req, res) => {
  try {
    const { id } = req.query;
    
    if (!id) {
      return res.status(400).json({ 
        ok: false, 
        message: 'Job ID is required' 
      });
    }

    const job = await database.getJobById(id);
    
    if (!job) {
      return res.status(404).json({ 
        ok: false, 
        message: 'Job not found' 
      });
    }

    res.json({ ok: true, job });
  } catch (error) {
    console.error('Get job error:', error);
    res.status(500).json({ 
      ok: false, 
      message: 'Failed to fetch job' 
    });
  }
});

// Create new job
app.post('/backend/jobs_create', async (req, res) => {
  try {
    const { title, company, description, requirements, salary, location, education, job_type, category, posted_by } = req.body;
    
    // Validate required fields
    if (!title || !company || !description || !posted_by) {
      return res.status(400).json({ 
        ok: false, 
        message: 'Title, company, description, and posted_by are required' 
      });
    }

    const jobData = {
      title,
      company,
      description,
      requirements: requirements || '',
      salary: salary || '',
      location: location || '',
      education: education || '',
      job_type: job_type || 'Full Time',
      category: category || 'General',
      status: 'active',
      posted_by: parseInt(posted_by)
    };

    const newJob = await database.createJob(jobData);
    
    res.json({ 
      ok: true, 
      message: 'Job created successfully',
      job: newJob
    });
  } catch (error) {
    console.error('Create job error:', error);
    res.status(500).json({ 
      ok: false, 
      message: 'Failed to create job' 
    });
  }
});

// Update job status
app.post('/backend/jobs_status', async (req, res) => {
  try {
    const { id, status } = req.body;
    
    if (!id || !status) {
      return res.status(400).json({ 
        ok: false, 
        message: 'Job ID and status are required' 
      });
    }

    const updatedJob = await database.updateJob(id, { status });
    
    if (!updatedJob) {
      return res.status(404).json({ 
        ok: false, 
        message: 'Job not found' 
      });
    }

    res.json({ 
      ok: true, 
      message: 'Job status updated successfully',
      job: updatedJob
    });
  } catch (error) {
    console.error('Update job status error:', error);
    res.status(500).json({ 
      ok: false, 
      message: 'Failed to update job status' 
    });
  }
});

// Delete job
app.post('/backend/jobs_delete', async (req, res) => {
  try {
    const { id } = req.body;
    
    if (!id) {
      return res.status(400).json({ 
        ok: false, 
        message: 'Job ID is required' 
      });
    }

    const deletedJob = await database.deleteJob(id);
    
    if (!deletedJob) {
      return res.status(404).json({ 
        ok: false, 
        message: 'Job not found' 
      });
    }

    res.json({ 
      ok: true, 
      message: 'Job deleted successfully'
    });
  } catch (error) {
    console.error('Delete job error:', error);
    res.status(500).json({ 
      ok: false, 
      message: 'Failed to delete job' 
    });
  }
});

// ===== APPLICATION ENDPOINTS =====

// Create job application
app.post('/backend/apply_create', async (req, res) => {
  try {
    const { job_id, user_id, applicant_name, applicant_phone, applicant_email, message } = req.body;
    
    if (!job_id || !user_id) {
      return res.status(400).json({ 
        ok: false, 
        message: 'Job ID and User ID are required' 
      });
    }

    // Check if already applied
    const existingApplications = await database.getApplications({ job_id, user_id });
    if (existingApplications.length > 0) {
      return res.status(400).json({ 
        ok: false, 
        message: 'You have already applied for this job' 
      });
    }

    const applicationData = {
      job_id: parseInt(job_id),
      user_id: parseInt(user_id),
      applicant_name: applicant_name || '',
      applicant_phone: applicant_phone || '',
      applicant_email: applicant_email || '',
      message: message || '',
      status: 'pending'
    };

    const newApplication = await database.createApplication(applicationData);
    
    res.json({ 
      ok: true, 
      message: 'Application submitted successfully',
      application: newApplication
    });
  } catch (error) {
    console.error('Create application error:', error);
    res.status(500).json({ 
      ok: false, 
      message: 'Failed to submit application' 
    });
  }
});

// Get applications
app.get('/backend/applications_list', async (req, res) => {
  try {
    const { job_id, user_id } = req.query;
    
    const filters = {};
    if (job_id) filters.job_id = job_id;
    if (user_id) filters.user_id = user_id;

    const applications = await database.getApplications(filters);
    
    // Get job details for each application
    const applicationsWithDetails = await Promise.all(
      applications.map(async (app) => {
        const job = await database.getJobById(app.job_id);
        const user = await database.findUserById(app.user_id);
        return {
          ...app,
          job: job ? {
            id: job.id,
            title: job.title,
            company: job.company
          } : null,
          user: user ? {
            id: user.id,
            name: user.name,
            email: user.email
          } : null
        };
      })
    );
    
    res.json({ ok: true, applications: applicationsWithDetails });
  } catch (error) {
    console.error('Get applications error:', error);
    res.status(500).json({ 
      ok: false, 
      message: 'Failed to fetch applications' 
    });
  }
});

// ===== UTILITY ENDPOINTS =====

// Get database statistics
app.get('/backend/stats', async (req, res) => {
  try {
    const stats = database.getStats();
    res.json({ ok: true, stats });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ 
      ok: false, 
      message: 'Failed to fetch statistics' 
    });
  }
});

// Reset database (for testing)
app.post('/backend/reset', async (req, res) => {
  try {
    database.reset();
    res.json({ 
      ok: true, 
      message: 'Database reset successfully' 
    });
  } catch (error) {
    console.error('Reset database error:', error);
    res.status(500).json({ 
      ok: false, 
      message: 'Failed to reset database' 
    });
  }
});

// ===== DEFAULT ROUTE =====

// Serve index.html for all other routes (SPA support)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'index.html'));
});

// ===== START SERVER =====

const PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.HOST || '0.0.0.0';

app.listen(PORT, HOST, () => {
  console.log('🚀 12th Fail Jobs Server Started!');
  console.log(`📍 Server running on http://${HOST}:${PORT}`);
  console.log('📊 Database initialized with sample data');
  console.log('');
  console.log('👤 Sample Login Accounts:');
  console.log('   Worker: rahul@example.com / password123');
  console.log('   Recruiter: priya@example.com / password123');
  console.log('   Worker: amit@example.com / password123');
  console.log('');
  console.log('🔧 Available Endpoints:');
  console.log('   POST /backend/auth_register - Register user');
  console.log('   POST /backend/auth_login - Login user');
  console.log('   GET  /backend/jobs_list - Get jobs');
  console.log('   GET  /backend/job_get - Get single job');
  console.log('   POST /backend/jobs_create - Create job');
  console.log('   POST /backend/jobs_status - Update job status');
  console.log('   POST /backend/jobs_delete - Delete job');
  console.log('   POST /backend/apply_create - Apply for job');
  console.log('   GET  /backend/applications_list - Get applications');
  console.log('   GET  /backend/stats - Get statistics');
  console.log('   POST /backend/reset - Reset database');
  console.log('');
});

module.exports = app;

