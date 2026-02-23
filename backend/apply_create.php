<?php
require_once "config.php";
$data = json_decode(file_get_contents("php://input"), true);

$job_id = (int)($data["job_id"] ?? 0);
$name = trim($data["applicant_name"] ?? "");
$phone = trim($data["applicant_phone"] ?? "");
$email = trim($data["applicant_email"] ?? "");
$message = trim($data["message"] ?? "");

if ($job_id <= 0 || $name === "" || $phone === "") {
  http_response_code(400);
  echo json_encode(["ok" => false, "message" => "Job, name, phone required"]);
  exit;
}

// Check job exists and is active/accessible
$chk = $conn->prepare("SELECT id, created_by, status FROM jobs WHERE id = ? LIMIT 1");
$chk->bind_param("i", $job_id);
$chk->execute();
$jobRes = $chk->get_result();
if ($jobRes->num_rows === 0) {
  http_response_code(404);
  echo json_encode(["ok" => false, "message" => "Job not found"]);
  $chk->close();
  $conn->close();
  exit;
}
$jobRow = $jobRes->fetch_assoc();
$chk->close();

// If status column exists and job is closed/expired, block new applications
if (isset($jobRow["status"]) && in_array($jobRow["status"], ["closed", "expired"], true)) {
  http_response_code(400);
  echo json_encode(["ok" => false, "message" => "This job is not accepting applications"]);
  $conn->close();
  exit;
}

// Prevent duplicates by same phone for same job
$dup = $conn->prepare("SELECT id FROM applications WHERE job_id = ? AND applicant_phone = ? LIMIT 1");
$dup->bind_param("is", $job_id, $phone);
$dup->execute();
$dupRes = $dup->get_result();
if ($dupRes && $dupRes->num_rows > 0) {
  $row = $dupRes->fetch_assoc();
  $dup->close();
  echo json_encode(["ok" => true, "message" => "Already applied", "application_id" => $row["id"], "duplicate" => true]);
  $conn->close();
  exit;
}
$dup->close();

$stmt = $conn->prepare("INSERT INTO applications (job_id, applicant_name, applicant_phone, applicant_email, message) VALUES (?, ?, ?, ?, ?)");
$stmt->bind_param("issss", $job_id, $name, $phone, $email, $message);

if ($stmt->execute()) {
  echo json_encode(["ok" => true, "message" => "Applied successfully", "application_id" => $conn->insert_id]);
} else {
  http_response_code(500);
  echo json_encode(["ok" => false, "message" => "Failed to apply"]);
}

$stmt->close();
$conn->close();
?>
