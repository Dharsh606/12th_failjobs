<?php
require_once "config.php";
$data = json_decode(file_get_contents("php://input"), true);

$email = trim($data["email"] ?? "");
$password = $data["password"] ?? "";

$stmt = $conn->prepare("SELECT id, name, email, password, role FROM users WHERE email=? LIMIT 1");
$stmt->bind_param("s", $email);
$stmt->execute();
$res = $stmt->get_result();

if ($res->num_rows === 0) { http_response_code(401); echo json_encode(["ok"=>false,"message"=>"Invalid login"]); exit; }
$user = $res->fetch_assoc();

if (!password_verify($password, $user["password"])) { http_response_code(401); echo json_encode(["ok"=>false,"message"=>"Invalid login"]); exit; }

if ($user["role"] === "employer") $user["role"] = "recruiter";
if ($user["role"] === "jobseeker") $user["role"] = "worker";

unset($user["password"]);
echo json_encode(["ok" => true, "user" => $user]);

$stmt->close(); $conn->close();
?>
