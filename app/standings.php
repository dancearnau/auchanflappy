<style>
    ::-webkit-scrollbar {
        display: none;
    }
</style>
<body style="overflow: scroll;">
<div style="overflow: hidden;">
<h2 style="text-align: center;">Clasament</h2>
<table style="text-align: center; width: 100%; overflow: hidden;">
    <?php

        function cmp($a, $b)
        {
            return (int)$a->score < (int)$b->score;
        }

        $json = file_get_contents('../db/users.json');
        $users = json_decode($json);
        usort($users, "cmp");
        foreach($users as $user) {
            echo '<tr><td>' . $user->name . '</td><td>' . $user->score . ' puncte </td></tr>';
        }
    ?>
</table>
</div>
</body>