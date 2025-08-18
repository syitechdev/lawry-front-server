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
use App\Http\Controllers\Admin\TarifUniqueActiveController;

use App\Http\Controllers\PublicFormationController;
use App\Http\Controllers\PublicRegistrationController;

Route::patch('/admin/tarifs/{tarif}/active', [TarifUniqueActiveController::class, 'update']);

Route::prefix('v1')->group(function () {
    // Public
    Route::post('auth/register', [AuthController::class, 'register']);
    Route::post('auth/login',    [AuthController::class, 'login']);
    Route::post('auth/forgot-password', [AuthController::class, 'forgotPassword'])
        ->middleware('throttle:6,1');
    Route::post('auth/reset-password',  [AuthController::class, 'resetPassword'])
        ->middleware('throttle:6,1');

    Route::get('public/formations', [PublicFormationController::class, 'index']);
    Route::post('public/formation-registrations', [PublicRegistrationController::class, 'store']);



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

        Route::patch('/admin/tarifs/{tarif}/active', [TarifUniqueActiveController::class, 'update']);


        Route::patch('admin/boutiques/{boutique}/active', [BoutiqueActiveController::class, 'update']);
        Route::post('admin/boutiques/{boutique}/image',  [BoutiqueActiveController::class, 'store']);

        Route::patch('admin/services/{service}/active', [ServiceActiveController::class, 'update']);
    });
});
