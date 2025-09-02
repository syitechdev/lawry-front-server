<?php

namespace App\Policies;

use App\Models\Contact;
use App\Models\User;

class ContactPolicy
{
    /**
     * Déterminer si l’utilisateur peut voir la liste des contacts
     */
    public function viewAny(User $user): bool
    {
        return $user->can('contacts.read');
    }

    /**
     * Déterminer si l’utilisateur peut voir un contact spécifique
     */
    public function view(User $user, Contact $contact): bool
    {
        return $user->can('contacts.read');
    }

    /**
     * Déterminer si l’utilisateur peut créer un contact
     * (optionnel, car public via API publique)
     */
    public function create(?User $user): bool
    {
        return true;
    }

    /**
     * Déterminer si l’utilisateur peut mettre à jour un contact
     */
    public function update(User $user, Contact $contact): bool
    {
        return $user->can('contacts.update');
    }

    /**
     * Déterminer si l’utilisateur peut supprimer un contact
     */
    public function delete(User $user, Contact $contact): bool
    {
        return $user->can('contacts.delete');
    }
}
