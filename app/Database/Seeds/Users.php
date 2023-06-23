<?php

namespace App\Database\Seeds;

use CodeIgniter\Database\Seeder;
use CodeIgniter\I18n\Time;
use Ramsey\Uuid\Uuid;

class Users extends Seeder
{
    public function run()
    {
        $faker = \Faker\Factory::create('id_ID');

        for ($i = 0; $i < 100; $i++) {
            $data =
                [
                    'name'          =>   $faker->userName(),
                    'uuid'          => Uuid::uuid4()->toString(),
                    'email'         =>  $faker->email(),
                    'img'   => $faker->imageUrl(),
                    'password'  => password_hash(12345678, PASSWORD_BCRYPT),
                    'created_at' => Time::now(),
                    'updated_at' => Time::now(),
                ];
            $this->db->table('users')->insert($data);
        }
    }
}
