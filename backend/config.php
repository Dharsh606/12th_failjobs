<?php
header("Content-Type: application/json; charset=UTF-8");

$host = getenv('DB_HOST') ?: getenv('MYSQLHOST') ?: 'localhost';
$user = getenv('DB_USER') ?: getenv('MYSQLUSER') ?: 'root';
$pass = getenv('DB_PASS') ?: getenv('MYSQLPASSWORD') ?: '';
$dbname = getenv('DB_NAME') ?: getenv('MYSQLDATABASE') ?: 'failjob_db';
$port = (int)(getenv('DB_PORT') ?: getenv('MYSQLPORT') ?: 3306);

$conn = new mysqli($host, $user, $pass, $dbname, $port);

if ($conn->connect_error) {
  http_response_code(500);
  echo json_encode(["ok" => false, "message" => "DB connection failed"]);
  exit;
}

$conn->set_charset("utf8mb4");
?>
