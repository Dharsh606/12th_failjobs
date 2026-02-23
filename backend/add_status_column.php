<?php
require_once "config.php";

// Add status column to jobs table if it doesn't exist
$alter_sql = "ALTER TABLE jobs ADD COLUMN status VARCHAR(20) DEFAULT 'active' AFTER category";

if ($conn->query($alter_sql)) {
    echo json_encode(["ok" => true, "message" => "Status column added successfully"]);
} else {
    // Check if error is because column already exists
    if ($conn->errno == 1060) {
        echo json_encode(["ok" => true, "message" => "Status column already exists"]);
    } else {
        http_response_code(500);
        echo json_encode(["ok" => false, "message" => "Failed to add status column: " . $conn->error]);
    }
}

$conn->close();
?>
