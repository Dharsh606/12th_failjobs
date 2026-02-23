<?php
require_once "config.php";

$data = json_decode(file_get_contents("php://input"), true);
$job_id = (int)($data["job_id"] ?? 0);
$recruiter_id = (int)($data["recruiter_id"] ?? 0);

if ($job_id === 0 || $recruiter_id === 0) {
  http_response_code(400);
  echo json_encode(["ok" => false, "message" => "Invalid request"]);
  exit;
}

// First check if the job belongs to this recruiter
$stmt = $conn->prepare("SELECT id FROM jobs WHERE id = ? AND created_by = ?");
$stmt->bind_param("ii", $job_id, $recruiter_id);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
  http_response_code(403);
  echo json_encode(["ok" => false, "message" => "Job not found or access denied"]);
  $stmt->close();
  $conn->close();
  exit;
}

$stmt->close();

// Delete the job
$stmt = $conn->prepare("DELETE FROM jobs WHERE id = ? AND created_by = ?");
$stmt->bind_param("ii", $job_id, $recruiter_id);

if ($stmt->execute()) {
  echo json_encode(["ok" => true, "message" => "Job deleted successfully"]);
} else {
  http_response_code(500);
  echo json_encode(["ok" => false, "message" => "Failed to delete job"]);
}

$stmt->close();
$conn->close();
?>
