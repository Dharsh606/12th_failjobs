<?php
require_once "config.php";
$data = json_decode(file_get_contents("php://input"), true);

$name = trim($data["name"] ?? "");
$email = trim($data["email"] ?? "");
$password = $data["password"] ?? "";
$role = $data["role"] ?? "jobseeker";

if ($name === "" || $email === "" || $password === "") {
  http_response_code(400);
  echo json_encode(["ok" => false, "message" => "All fields are required"]);
  exit;
}

$hashed = password_hash($password, PASSWORD_DEFAULT);

$stmt = $conn->prepare("INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)");
$stmt->bind_param("ssss", $name, $email, $hashed, $role);

if ($stmt->execute()) echo json_encode(["ok" => true, "message" => "Registered"]);
else { http_response_code(400); echo json_encode(["ok" => false, "message" => "Email already exists"]); }

$stmt->close(); $conn->close();
?>
