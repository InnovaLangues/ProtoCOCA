<?php

if (isset($_FILES["file"])) {
    
    $fileName = trim($_POST["filename"]);    
    $uploadDirectory = $_POST["directory"].$fileName;
    
    if (!move_uploaded_file($_FILES["file"]["tmp_name"], $uploadDirectory)) {
        echo("problem moving uploaded file");
    } else {
        $fileInfo = pathinfo($uploadDirectory); 
        echo json_encode($fileInfo);
    }
}
