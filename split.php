<?php

// NEEDS 777 permissions on "processed" directory to work
// TODO CLEAN FILE NAME
if (isset($_POST["fUrl"])) {

    $fUrl = $_POST ["fUrl"];
    if (file_exists($fUrl) && isset($_POST["segments"])) {
        $segments = json_decode($_POST["segments"]);
        $i = 0;       
        // array of created files url
        $result = [];
        // base directory for processed files
        $baseDir = 'processed/';
        // make directory for this audio file
        $fileName = basename($fUrl, ".mp3");
        $dir = $baseDir . $fileName;
        // if directory exists we need to clear it before adding new files
        if (file_exists($dir) && is_dir($dir)) {
            foreach (new DirectoryIterator($dir) as $fileInfo) {
                if (!$fileInfo->isDot()) {
                    unlink($fileInfo->getPathname());
                }
            }
        }
        else{
            mkdir($dir, 0777);
        }
        foreach ($segments as $s) {
            $unique_name = $dir . '/' . $i . '_' . $fileName . '.mp3';
            $command = 'avconv -i ' . $fUrl . ' -ss ' . $s->start . ' -t ' . $s->end . ' -acodec copy -y ' . $unique_name;

            exec($command);
            array_push($result, $unique_name);
            $i ++;
        }
        echo json_encode($result);
    }
}

