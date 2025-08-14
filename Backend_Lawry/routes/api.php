<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\Admin\UserManagementController;
use App\Http\Controllers\Admin\FormationActiveController;
use App\Http\Controllers\Admin\PlanActiveController;
use App\Http\Controllers\Admin\PlanPopularController;
use App\Http\Controllers\Admin\BoutiqueActiveController;
use App\Http\Controllers\Admin\ServiceActiveController;
use App\Http\Controllers\UploadController;




Route::prefix('v1')->group(function () {
    // Public
    Route::post('auth/register', [AuthController::class, 'register']);
    Route::post('auth/login',    [AuthController::class, 'login']);


    //Log only
    Route::middleware('auth:sanctum')->group(function () {
        Route::get('auth/me',      [AuthController::class, 'me']);
        Route::post('auth/logout', [AuthController::class, 'logout']);

        Route::post('/upload', [UploadController::class, 'store'])->name('upload.store');;

        Route::patch('auth/update-me', [AuthController::class, 'updateMe']);


        // Admin only
        Route::get('admin/users',            [UserManagementController::class, 'index']);
        Route::post('admin/users',           [UserManagementController::class, 'createUser']);
        Route::put('admin/users/{user}/role', [UserManagementController::class, 'updateRole']);
        Route::patch('admin/users/{user}', [UserManagementController::class, 'update']);
        Route::delete('admin/users/{user}', [UserManagementController::class, 'destroy']);

        Route::patch('admin/formations/{formation}/active', [FormationActiveController::class, 'update'])
            ->name('admin.formations.active.update');
        Route::patch('admin/plans/{plan}/active',  [PlanActiveController::class,  'update']);
        Route::patch('admin/plans/{plan}/popular', [PlanPopularController::class, 'update']);

        Route::patch('admin/boutiques/{boutique}/active', [BoutiqueActiveController::class, 'update']);
        Route::post('admin/boutiques/{boutique}/image',  [BoutiqueActiveController::class, 'store']);

        Route::patch('admin/services/{service}/active', [ServiceActiveController::class, 'update']);
    });
});
