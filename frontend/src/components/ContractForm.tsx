
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { FileText, Download } from "lucide-react";

interface ContractFormProps {
  contractType: string;
  onGenerate: (contractData: any) => void;
}

const ContractForm = ({ contractType, onGenerate }: ContractFormProps) => {
  const [formData, setFormData] = useState<any>({});

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGenerate({ ...formData, type: contractType });
  };

  const renderFormFields = () => {
    switch (contractType) {
      case 'travail-cdi':
        return (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="entreprise">Nom de l'entreprise</Label>
                <Input 
                  id="entreprise" 
                  value={formData.entreprise || ''}
                  onChange={(e) => handleInputChange('entreprise', e.target.value)}
                  placeholder="LAWRY SARL"
                />
              </div>
              <div>
                <Label htmlFor="capital">Capital social (FCFA)</Label>
                <Input 
                  id="capital" 
                  value={formData.capital || ''}
                  onChange={(e) => handleInputChange('capital', e.target.value)}
                  placeholder="1 000 000"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="adresse-entreprise">Adresse de l'entreprise</Label>
              <Input 
                id="adresse-entreprise" 
                value={formData.adresseEntreprise || ''}
                onChange={(e) => handleInputChange('adresseEntreprise', e.target.value)}
                placeholder="Abidjan, Cocody"
              />
            </div>

            <div>
              <Label htmlFor="representant">Représentant légal</Label>
              <Input 
                id="representant" 
                value={formData.representant || ''}
                onChange={(e) => handleInputChange('representant', e.target.value)}
                placeholder="Nom du représentant"
              />
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="nom-salarie">Nom du salarié</Label>
                <Input 
                  id="nom-salarie" 
                  value={formData.nomSalarie ||''}
                  onChange={(e) => handleInputChange('nomSalarie', e.target.value)}
                  placeholder="Nom et prénoms"
                />
              </div>
              <div>
                <Label htmlFor="date-naissance">Date de naissance</Label>
                <Input 
                  id="date-naissance" 
                  type="date"
                  value={formData.dateNaissance || ''}
                  onChange={(e) => handleInputChange('dateNaissance', e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="adresse-salarie">Adresse du salarié</Label>
              <Input 
                id="adresse-salarie" 
                value={formData.adresseSalarie || ''}
                onChange={(e) => handleInputChange('adresseSalarie', e.target.value)}
                placeholder="Adresse complète"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="poste">Poste</Label>
                <Input 
                  id="poste" 
                  value={formData.poste || ''}
                  onChange={(e) => handleInputChange('poste', e.target.value)}
                  placeholder="Intitulé du poste"
                />
              </div>
              <div>
                <Label htmlFor="date-debut">Date de début</Label>
                <Input 
                  id="date-debut" 
                  type="date"
                  value={formData.dateDebut || ''}
                  onChange={(e) => handleInputChange('dateDebut', e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="salaire">Salaire mensuel brut (FCFA)</Label>
              <Input 
                id="salaire" 
                value={formData.salaire || ''}
                onChange={(e) => handleInputChange('salaire', e.target.value)}
                placeholder="150 000"
              />
            </div>
          </>
        );

      case 'nda':
        return (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="partie1">Partie 1</Label>
                <Input 
                  id="partie1" 
                  value={formData.partie1 || ''}
                  onChange={(e) => handleInputChange('partie1', e.target.value)}
                  placeholder="Nom de la première partie"
                />
              </div>
              <div>
                <Label htmlFor="partie2">Partie 2</Label>
                <Input 
                  id="partie2" 
                  value={formData.partie2 || ''}
                  onChange={(e) => handleInputChange('partie2', e.target.value)}
                  placeholder="Nom de la deuxième partie"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="objet">Objet de la confidentialité</Label>
              <Textarea 
                id="objet" 
                value={formData.objet || ''}
                onChange={(e) => handleInputChange('objet', e.target.value)}
                placeholder="Décrivez l'objet de l'accord de confidentialité"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="duree">Durée de l'accord</Label>
              <Select value={formData.duree || ''} onValueChange={(value) => handleInputChange('duree', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez la durée" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1 an">1 an</SelectItem>
                  <SelectItem value="2 ans">2 ans</SelectItem>
                  <SelectItem value="3 ans">3 ans</SelectItem>
                  <SelectItem value="5 ans">5 ans</SelectItem>
                  <SelectItem value="indéterminée">Indéterminée</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        );

      case 'bail-commercial':
        return (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="bailleur">Nom du bailleur</Label>
                <Input 
                  id="bailleur" 
                  value={formData.bailleur || ''}
                  onChange={(e) => handleInputChange('bailleur', e.target.value)}
                  placeholder="Nom du propriétaire"
                />
              </div>
              <div>
                <Label htmlFor="locataire">Nom du locataire</Label>
                <Input 
                  id="locataire" 
                  value={formData.locataire || ''}
                  onChange={(e) => handleInputChange('locataire', e.target.value)}
                  placeholder="Nom du locataire"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="bien">Description du bien</Label>
              <Textarea 
                id="bien" 
                value={formData.bien || ''}
                onChange={(e) => handleInputChange('bien', e.target.value)}
                placeholder="Description détaillée du local commercial"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="loyer">Loyer mensuel (FCFA)</Label>
                <Input 
                  id="loyer" 
                  value={formData.loyer || ''}
                  onChange={(e) => handleInputChange('loyer', e.target.value)}
                  placeholder="500 000"
                />
              </div>
              <div>
                <Label htmlFor="duree-bail">Durée du bail</Label>
                <Select value={formData.dureeBail || ''} onValueChange={(value) => handleInputChange('dureeBail', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Durée" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3 ans">3 ans</SelectItem>
                    <SelectItem value="6 ans">6 ans</SelectItem>
                    <SelectItem value="9 ans">9 ans</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </>
        );

      default:
        return (
          <div>
            <Label htmlFor="details">Détails du contrat</Label>
            <Textarea 
              id="details" 
              value={formData.details || ''}
              onChange={(e) => handleInputChange('details', e.target.value)}
              placeholder="Décrivez les détails spécifiques de votre contrat"
              rows={4}
            />
          </div>
        );
    }
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center">
          <FileText className="h-5 w-5 mr-2 text-red-900" />
          Formulaire de génération de contrat
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {renderFormFields()}
          
          <div className="flex justify-end pt-4">
            <Button type="submit" className="bg-red-900 hover:bg-red-800">
              <Download className="h-4 w-4 mr-2" />
              Générer le contrat
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ContractForm;
