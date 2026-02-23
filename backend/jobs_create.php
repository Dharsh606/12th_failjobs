<?php
require_once "config.php";
$data = json_decode(file_get_contents("php://input"), true);

$title = trim($data["title"] ?? "");
$company = trim($data["company"] ?? "");
$location = trim($data["location"] ?? "");
$salary = trim($data["salary"] ?? "");
$education = trim($data["education"] ?? "");
$job_type = trim($data["job_type"] ?? "");
$description = trim($data["description"] ?? "");
$requirements = trim($data["requirements"] ?? "");
$contact = trim($data["contact"] ?? "");
$created_by = (int)($data["created_by"] ?? 0);
$category = trim($data["category"] ?? "");

if ($title === "" || $company === "" || $location === "" || $education === "" || $job_type === "" || $description === "" || $contact === "") {
  http_response_code(400);
  echo json_encode(["ok" => false, "message" => "Please fill all required fields"]);
  exit;
}

$stmt = $conn->prepare("INSERT INTO jobs (title, company, location, salary, education, job_type, description, requirements, contact, created_by, category)
VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");

$stmt->bind_param("sssssssssis",
  $title, $company, $location, $salary, $education, $job_type, $description, $requirements, $contact, $created_by, $category
);

if ($stmt->execute()) {
  echo json_encode(["ok" => true, "message" => "Job posted", "job_id" => $conn->insert_id]);
} else {
  http_response_code(500);
  echo json_encode(["ok" => false, "message" => "Failed to post job"]);
}

$stmt->close();
$conn->close();
?>
