<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\FormationActiveRequest;
use App\Models\Formation;

class FormationActiveController extends Controller
{
    public function update(FormationActiveRequest $request, Formation $formation)
    {
        $formation->active = $request->boolean('active');
        $formation->save();

        return response()->json($formation);
    }
}
