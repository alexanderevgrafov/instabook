<?php

set_time_limit(0);
date_default_timezone_set('UTC');

require __DIR__ . '/../../vendor/autoload.php';

function exceptionJson( \Exception $e ) {
    echo '{"error":"' . $e->getMessage() . '"}';
    exit(0);
}
$debug = false;
$truncatedDebug = false;

$storage_mysql = [
    'storage' => 'mysql',
    'dbhost' => 'localhost',
    'dbname' => 'instabook',
    'dbusername' => 'root',
    'dbpassword' => 'root1',
];

$storage_file = [
    'storage' => 'file',
    'basefolder' => __DIR__ . '/storage',
];

$ig = new \InstagramAPI\Instagram($debug, $truncatedDebug, $storage_file);

try {
    $ig->login($argv[1], $argv[2]);
} catch (\Exception $e) {
    exceptionJson($e);
}

try {
    switch($argv[3]) {
        case 'folders':
            $feed = $ig->collection->getList();
            $feed->printJson();
            break;
        case 'folder_content':
            $feed = $ig->collection->getFeed($argv[4]);
            $feed->printJson();
            break;
        case 'login':
            $feed = $ig->account->getCurrentUser();
            $feed->printJson();
            break;
        default:
            echo '{"status":"command-unknown"}';
    }
} catch (\Exception $e) {
    exceptionJson($e);
}
