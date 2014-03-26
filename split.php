<?php

// NEEDS 777 permissions on "processed" directory to work
if (isset($_POST["fUrl"])) {

    $fUrl = $_POST ["fUrl"];
    if (file_exists($fUrl) && isset($_POST["segments"])) {
        $segments = json_decode($_POST["segments"]);
        $i = 0;       
        $output = [];
        foreach ($segments as $s) {
            
            $command = 'avconv -i ' . $fUrl . ' -ss ' . $s -> start . ' -t ' . $s -> end . ' -acodec copy -y processed/' . $i . '_p.mp3';
            //echo $command;
            
            exec($command, $output);

            $i ++;
        }
        echo json_encode($output);
    }
}

