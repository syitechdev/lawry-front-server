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
use App\Http\Controllers\FormationController;
use App\Http\Controllers\RegistrationController;
use App\Http\Controllers\Admin\RegistrationAdminController;
use App\Http\Controllers\DemandesController;
use App\Http\Controllers\Admin\RequestTypeController;
use App\Http\Controllers\EnterpriseTypesPublicController;
use App\Http\Controllers\Admin\EnterpriseTypeController;
use App\Http\Controllers\Admin\EnterpriseTypeOffersController;
use App\Http\Controllers\Admin\RequestTypePublicController;





Route::patch('/admin/tarifs/{tarif}/active', [TarifUniqueActiveController::class, 'update']);

Route::prefix('v1')->group(function () {
    // Public
    Route::post('auth/register', [AuthController::class, 'register']);
    Route::post('auth/login',    [AuthController::class, 'login']);
    Route::post('auth/forgot-password', [AuthController::class, 'forgotPassword'])
        ->middleware('throttle:6,1');
    Route::post('auth/reset-password',  [AuthController::class, 'resetPassword'])
        ->middleware('throttle:6,1');

    Route::get('public/formations', [FormationController::class, 'indexPublic']);
    Route::post('public/registrations', [RegistrationController::class, 'store']);
    Route::get('registrations/mine', [RegistrationController::class, 'mine'])->middleware('auth:sanctum');
    Route::get('public/registrations/mine', [RegistrationController::class, 'mine'])->middleware('auth:sanctum');

    //Demande management
    Route::post('demandes', [DemandesController::class, 'store']);
    Route::get('/request-types/rediger-contrat', [RequestTypeController::class, 'publicContrats']);
    Route::get('/request-types/rediger-contrat/variants/{key}', [RequestTypeController::class, 'publicContratVariant']);

    Route::get('/request-types/slug/{slug}', [RequestTypePublicController::class, 'showBySlug']);


    // Détail d'un type de demande par slug (ex: creer-entreprise)
    Route::get('/request-types/slug/{slug}', [RequestTypePublicController::class, 'showBySlug']);

    // Types d’entreprise (catalogue public)
    Route::get('/enterprise-types', [EnterpriseTypesPublicController::class, 'list']);
    Route::get('/enterprise-types/{sigle}', [EnterpriseTypesPublicController::class, 'show']);
    Route::get('/enterprise-types/{sigle}/offers', [EnterpriseTypesPublicController::class, 'offers']);



    //Log only
    Route::middleware('auth:sanctum')->group(function () {
        Route::get('auth/me',      [AuthController::class, 'me']);
        Route::post('auth/logout', [AuthController::class, 'logout']);

        Route::post('/upload', [UploadController::class, 'store'])->name('upload.store');

        Route::patch('auth/update-me', [AuthController::class, 'updateMe']);


        // Admin only
        Route::middleware('role:Admin')->group(function () {

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

            Route::get('admin/registrations', [RegistrationAdminController::class, 'index']);
            Route::post('admin/registrations/{id}/mark-read', [RegistrationAdminController::class, 'markRead']);
            Route::get('admin/registrations/unread-count', [RegistrationAdminController::class, 'unreadCount']);

            Route::get('admin/registrations/export', [RegistrationAdminController::class, 'export']);
            Route::get('admin/formations/{id}', [RegistrationAdminController::class, 'showFormation']);
            Route::get('admin/registrations/{id}', [\App\Http\Controllers\Admin\RegistrationAdminController::class, 'show']);
            Route::patch('admin/registrations/{id}', [\App\Http\Controllers\Admin\RegistrationAdminController::class, 'update']);

            // Gestion admin demande
            Route::get('admin/demandes/unread-count', [DemandesController::class, 'unreadCount']);
            Route::get('admin/demandes/export.csv',   [DemandesController::class, 'exportCsv']);

            Route::post('admin/demandes/{demande:ref}/files', [DemandesController::class, 'uploadFiles']);
            Route::get('admin/demandes/{demande:ref}/files/{file}', [DemandesController::class, 'viewFile'])
                ->whereNumber('file')
                ->name('demandes.files.view');

            Route::post('admin/demandes/{demande:ref}/mark-read',   [DemandesController::class, 'markRead']);
            Route::post('admin/demandes/{demande:ref}/unread', [DemandesController::class, 'markUnread']);
            Route::post('admin/demandes/{demande:ref}/status', [DemandesController::class, 'changeStatus']);
            Route::post('admin/demandes/{demande:ref}/assign', [DemandesController::class, 'assign']);
            Route::patch('admin/demandes/{demande:ref}/priority', [DemandesController::class, 'setPriority']);
            Route::post('admin/demandes/{demande:ref}/messages', [DemandesController::class, 'postMessage']);

            Route::get('admin/demandes', [DemandesController::class, 'index']);
            Route::get('admin/demandes/{demande:ref}', [DemandesController::class, 'show']);

            //type 
            Route::get('admin/request-types', [RequestTypeController::class, 'index']);
            Route::post('admin/request-types', [RequestTypeController::class, 'store']);
            Route::get('admin/request-types/{requestType}', [RequestTypeController::class, 'show']);
            Route::put('admin/request-types/{requestType}', [RequestTypeController::class, 'update']);
            Route::patch('admin/request-types/{requestType}/toggle', [RequestTypeController::class, 'toggle']);
            Route::delete('admin/request-types/{requestType}', [RequestTypeController::class, 'destroy']);

            Route::get('admin/enterprise-types/offers-counts', [\App\Http\Controllers\Admin\EnterpriseTypeController::class, 'offersCounts']);


            Route::get('admin/enterprise-types/{id}/offers', [EnterpriseTypeOffersController::class, 'index'])
                ->whereNumber('id')
                ->name('enterprise-types.offers.index');

            Route::post('admin/enterprise-types/{id}/offers', [EnterpriseTypeOffersController::class, 'store'])
                ->whereNumber('id')
                ->name('enterprise-types.offers.store');

            Route::post('admin/enterprise-types/{id}/offers/reorder', [EnterpriseTypeOffersController::class, 'reorder'])
                ->whereNumber('id')
                ->name('enterprise-types.offers.reorder');

            Route::patch('admin/enterprise-type-offers/{offer}', [EnterpriseTypeOffersController::class, 'update'])
                ->whereNumber('offer')
                ->name('enterprise-type-offers.update');

            Route::delete('admin/enterprise-type-offers/{offer}', [EnterpriseTypeOffersController::class, 'destroy'])
                ->whereNumber('offer')
                ->name('enterprise-type-offers.destroy');

            Route::post('admin/enterprise-type-offers/{offer}/publish', [EnterpriseTypeOffersController::class, 'publish'])
                ->whereNumber('offer')
                ->name('enterprise-type-offers.publish');

            Route::post('admin/enterprise-type-offers/{offer}/unpublish', [EnterpriseTypeOffersController::class, 'unpublish'])
                ->whereNumber('offer')
                ->name('enterprise-type-offers.unpublish');
        });

        Route::middleware(['auth:sanctum', 'permission:rbac.manage'])->prefix('admin/rbac')->group(function () {
            Route::get('roles', [\App\Http\Controllers\Admin\RbacController::class, 'rolesIndex']);
            Route::post('roles', [\App\Http\Controllers\Admin\RbacController::class, 'rolesStore']);
            Route::patch('roles/{role}', [\App\Http\Controllers\Admin\RbacController::class, 'rolesRename']);
            Route::delete('roles/{role}', [\App\Http\Controllers\Admin\RbacController::class, 'rolesDestroy']);

            Route::get('permissions', [\App\Http\Controllers\Admin\RbacController::class, 'permissionsIndex']);
            Route::put('roles/{role}/permissions', [\App\Http\Controllers\Admin\RbacController::class, 'rolesSyncPermissions']);
        });
    });
});
