<?php

require_once('json2csv.class.php');


if ($_GET['cmd'] == 'get') {
	$json = file_get_contents('users.json');
	$users = json_decode($json);
	usort($users, "cmp");
	echo json_encode($users);
} else if ($_GET['cmd'] == 'post') {
	$json = file_get_contents('users.json');
	$users = json_decode($json);

	$name = $_GET['name'];
	$score = $_GET['score'];
	$email = $_GET['email'];
	$facebookId = $_GET['facebookId'];
    $foundUser = false;
    foreach($users as $user) {
        if ($user->facebookId == $facebookId) {
            $user->score += $score;
            $foundUser = true;
            break;
        }
    }
    if (!$foundUser) {
        array_push($users, array('name' => $name, 'score' => (int)$score, 'facebookId' => $facebookId, 'email' => $email));
    }

	file_put_contents('users.json', json_encode($users));
	echo json_encode($users);
} else if ($_GET['cmd'] == 'export') {
	$JSON2CSV = new JSON2CSVutil;
	$JSON2CSV->readJSON(file_get_contents('users.json'));
	$JSON2CSV->flattenDL("JSON2.CSV");
}

function cmp($a, $b)
{
    return strcmp((int)$a->score, (int)$b->score);
}

?>