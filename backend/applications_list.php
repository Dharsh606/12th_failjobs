<?php
require_once "config.php";

$job_id = (int)($_GET["job_id"] ?? 0);
$recruiter_id = (int)($_GET["recruiter_id"] ?? 0);

if ($job_id <= 0) {
  http_response_code(400);
  echo json_encode(["ok" => false, "message" => "Invalid job id"]);
  exit;
}

// ✅ Simple ownership check (job must belong to recruiter)
if ($recruiter_id > 0) {
  $chk = $conn->prepare("SELECT id FROM jobs WHERE id=? AND created_by=? LIMIT 1");
  $chk->bind_param("ii", $job_id, $recruiter_id);
  $chk->execute();
  $r = $chk->get_result();
  if ($r->num_rows === 0) {
    http_response_code(403);
    echo json_encode(["ok" => false, "message" => "Access denied"]);
    exit;
  }
  $chk->close();
}

$stmt = $conn->prepare("SELECT id, job_id, applicant_name, applicant_phone, applicant_email, message, created_at
                        FROM applications
                        WHERE job_id=?
                        ORDER BY id DESC");
$stmt->bind_param("i", $job_id);
$stmt->execute();
$res = $stmt->get_result();

$apps = [];
while ($row = $res->fetch_assoc()) $apps[] = $row;

echo json_encode(["ok" => true, "applications" => $apps]);

$stmt->close();
$conn->close();
?>