<?php

return [
    'groups' => [
        'admin' => [
            'admin.*',
            'logout',
        ],
    ],
    'except' => [
        'debugbar.*',
        'horizon.*',
        'ignition.*',
    ],
]; 