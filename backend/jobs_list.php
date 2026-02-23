<?php
// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

require_once "config.php";

$q = trim($_GET["q"] ?? "");
$location = trim($_GET["location"] ?? "");
$education = trim($_GET["education"] ?? "");
$category = trim($_GET["category"] ?? "");
$created_by = intval($_GET["created_by"] ?? 0);

$sql = "SELECT id, title, company, location, salary, education, job_type, category, status, created_by, created_at
        FROM jobs
        WHERE 1=1";

$params = [];
$types = "";

// Search by title/company
if ($q !== "") {
  $sql .= " AND (title LIKE ? OR company LIKE ?)";
  $like = "%$q%";
  $params[] = $like;
  $params[] = $like;
  $types .= "ss";
}

// Location filter
if ($location !== "") {
  $sql .= " AND location LIKE ?";
  $params[] = "%$location%";
  $types .= "s";
}

// Education filter
if ($education !== "") {
  $sql .= " AND education LIKE ?";
  $params[] = "%$education%";
  $types .= "s";
}

// Category filter
if ($category !== "") {
  // Use exact match for category filtering
  $sql .= " AND category = ?";
  $params[] = $category;
  $types .= "s";
}

// Created by (recruiter) filter
if ($created_by > 0) {
  $sql .= " AND created_by = ?";
  $params[] = $created_by;
  $types .= "i";
}

$sql .= " ORDER BY id DESC";

// Debug: Show the final SQL query
error_log("Final SQL: " . $sql);
error_log("Params: " . print_r($params, true));

try {
    $stmt = $conn->prepare($sql);
    if ($types !== "") {
        $stmt->bind_param($types, ...$params);
    }

    $stmt->execute();
    $res = $stmt->get_result();

    $jobs = [];
    while ($row = $res->fetch_assoc()) $jobs[] = $row;

    echo json_encode(["ok" => true, "jobs" => $jobs]);

    $stmt->close();
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["ok" => false, "message" => "Database error: " . $e->getMessage()]);
}

$conn->close();
?>
