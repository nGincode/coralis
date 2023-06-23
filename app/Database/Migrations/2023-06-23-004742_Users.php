<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class Users extends Migration
{
    public function up()
    {
        $this->forge->addField([
            'id' => [
                'type' => "INT",
                'constraint' => 5,
                'unsigned'       => true,
                'auto_increment' => true,
            ],
            'uuid' => [
                'type' => "CHAR",
                'constraint' => 36,
                'unique'     => true,
            ],
            'name' => [
                'type' => "VARCHAR",
                'constraint' => 100,
                'unique'     => true,
            ],
            'email' => [
                'type' => "VARCHAR",
                'constraint' => 100,
                'unique'     => true,
            ],
            'password' => [
                'type' => "TEXT",
            ],
            'img' => [
                'type' => "VARCHAR",
                'constraint' => 200,
                'null' => true,
            ],
            'created_at' => [
                'type' => "DATETIME",
            ],
            'updated_at' => [
                'type' => "DATETIME",
            ]
        ]);
        $this->forge->addKey('id', true);
        $this->forge->createTable('users');
    }

    public function down()
    {
        //
    }
}
