<?php
require_once "config.php";
$id = (int)($_GET["id"] ?? 0);

$stmt = $conn->prepare("SELECT * FROM jobs WHERE id=? LIMIT 1");
$stmt->bind_param("i", $id);
$stmt->execute();
$res = $stmt->get_result();

if ($res->num_rows === 0) { http_response_code(404); echo json_encode(["ok"=>false,"message"=>"Not found"]); exit; }

echo json_encode(["ok" => true, "job" => $res->fetch_assoc()]);
$stmt->close(); $conn->close();
?>
