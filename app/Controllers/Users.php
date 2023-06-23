<?php

namespace App\Controllers;

use App\Models\Users as ModelsUsers;
use CodeIgniter\API\ResponseTrait;
use CodeIgniter\RESTful\ResourceController;
use Ramsey\Uuid\Uuid;

class Users extends ResourceController
{
    use ResponseTrait;
    /**
     * Return an array of resource objects, themselves in array format
     *
     * @return mixed
     */
    public function index()
    {
        $model = new ModelsUsers();
        $data = $model->findAll();
        return $this->respond($data);
    }

    /**
     * Return the properties of a resource object
     *
     * @return mixed
     */
    public function show($uuid = null)
    {
        $model = new ModelsUsers();
        $data = $model->where('uuid', $uuid)->first();
        if (!$data) return $this->failNotFound("Data Not Found");
        return $this->respond($data);
    }

    /**
     * Create a new resource object, from "posted" parameters
     *
     * @return mixed
     */
    public function create()
    {
        helper(['form']);
        $uuid = Uuid::uuid4();

        $rules = [
            'name' => 'required|is_unique[users.name]',
            'email' => 'required|valid_email|is_unique[users.email]',
            'password' => 'required|min_length[8]',
            'passconf' => 'required|matches[password]',
        ];

        if (!$this->validate($rules)) return $this->fail($this->validator->getErrors());

        $data = [
            'name' => $this->request->getVar('name'),
            'uuid' => $uuid->toString(),
            'password' => password_hash($this->request->getVar('password'), PASSWORD_DEFAULT),
            'email' => $this->request->getVar('email'),
            'img' => null,
            'created_at' => date('Y-m-d H:i:s'),
            'updated_at' => date('Y-m-d H:i:s')
        ];
        $model = new ModelsUsers();
        $model->save($data);
        $response = [
            'status' => 201,
            'error' => null,
            'messages' => [
                'success' => "created successfull",
            ]
        ];
        return $this->respondCreated($response);
    }


    /**
     * Add or update a model resource, from "posted" properties
     *
     * @return mixed
     */
    public function update($uuid = null)
    {

        $model = new ModelsUsers();
        $dataModel = $model->where('uuid', $uuid)->first();
        if (!$dataModel) return $this->failNotFound('No Data Found');
        $id = $dataModel['id'];

        helper(['form']);
        $rules = [
            'name' => "required|is_unique[users.name,id,{$id}]",
            'email' => "required|valid_email|is_unique[users.email,id,{$id}]",
            'password' => 'required|min_length[8]',
            'passconf' => 'required|matches[password]',
        ];

        if (!$this->validate($rules)) return $this->fail($this->validator->getErrors());

        $data = [
            'name' => $this->request->getVar('name'),
            'password' => password_hash($this->request->getVar('password'), PASSWORD_DEFAULT),
            'email' => $this->request->getVar('email'),
            'img' => null,
            'updated_at' => date('Y-m-d H:i:s')
        ];
        $model->update($id, $data);
        $response = [
            'status' => 201,
            'error' => null,
            'messages' => [
                'success' => "updated successfull"
            ]
        ];
        return $this->respond($response);
    }

    /**
     * Delete the designated resource object from the model
     *
     * @return mixed
     */
    public function delete($uuid = null)
    {
        $model = new ModelsUsers();
        $dataModel = $model->where('uuid', $uuid)->first();
        if (!$dataModel) return $this->failNotFound('No Data Found');
        $id = $dataModel['id'];

        $model->delete($id);
        $response = [
            'status' => 201,
            'error' => null,
            'messages' => [
                'success' => "deleted successfull"
            ]
        ];
        return $this->respond($response);
    }
}
