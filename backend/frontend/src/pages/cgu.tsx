import HomeLayout from "@/components/HomeLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function CGUPage() {
  return (
    <HomeLayout pageTitle="Conditions générales d'utilisation">
      <div className="flex-1 bg-light-bg py-8 md:py-12 px-4 md:px-6">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl md:text-3xl">
                Conditions générales d'utilisation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <p className="text-sm text-muted-foreground mb-4">
                  Dernière mise à jour : {new Date().toLocaleDateString("fr-FR")}
                </p>
              </div>

              <Separator />

              <section>
                <h2 className="text-xl font-semibold mb-3">1. Objet</h2>
                <p className="text-muted-foreground mb-4">
                  Les présentes Conditions Générales d'Utilisation (CGU) régissent l'utilisation de
                  la plateforme MyDietChef. En accédant et en utilisant notre service, vous acceptez
                  d'être lié par ces conditions.
                </p>
              </section>

              <Separator />

              <section>
                <h2 className="text-xl font-semibold mb-3">2. Description du service</h2>
                <p className="text-muted-foreground mb-4">
                  MyDietChef est une plateforme de suivi nutritionnel qui permet aux utilisateurs de
                  :
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li>Scanner et analyser leurs repas</li>
                  <li>Suivre leurs objectifs nutritionnels</li>
                  <li>Consulter des recettes personnalisées</li>
                  <li>Bénéficier d'un accompagnement par un coach</li>
                </ul>
              </section>

              <Separator />

              <section>
                <h2 className="text-xl font-semibold mb-3">3. Inscription et compte</h2>
                <p className="text-muted-foreground mb-4">
                  Pour utiliser nos services, vous devez créer un compte en fournissant des
                  informations exactes et à jour. Vous êtes responsable de la confidentialité de vos
                  identifiants de connexion.
                </p>
              </section>

              <Separator />

              <section>
                <h2 className="text-xl font-semibold mb-3">4. Utilisation du service</h2>
                <p className="text-muted-foreground mb-4">
                  Vous vous engagez à utiliser la plateforme de manière licite et conforme à sa
                  destination. Il est interdit de :
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li>Utiliser le service à des fins illégales</li>
                  <li>Tenter d'accéder à des zones non autorisées</li>
                  <li>Perturber le fonctionnement du service</li>
                  <li>Copier ou reproduire le contenu sans autorisation</li>
                </ul>
              </section>

              <Separator />

              <section>
                <h2 className="text-xl font-semibold mb-3">5. Propriété intellectuelle</h2>
                <p className="text-muted-foreground mb-4">
                  Tous les contenus présents sur MyDietChef (textes, images, logos, logiciels) sont
                  la propriété exclusive de MyDietChef ou de ses partenaires et sont protégés par
                  les lois sur la propriété intellectuelle.
                </p>
              </section>

              <Separator />

              <section>
                <h2 className="text-xl font-semibold mb-3">6. Responsabilité</h2>
                <p className="text-muted-foreground mb-4">
                  MyDietChef ne peut être tenu responsable des dommages directs ou indirects
                  résultant de l'utilisation ou de l'impossibilité d'utiliser le service. Les
                  informations nutritionnelles fournies sont à titre indicatif et ne remplacent pas
                  l'avis d'un professionnel de santé.
                </p>
              </section>

              <Separator />

              <section>
                <h2 className="text-xl font-semibold mb-3">7. Modification des CGU</h2>
                <p className="text-muted-foreground mb-4">
                  Nous nous réservons le droit de modifier les présentes CGU à tout moment. Les
                  modifications entrent en vigueur dès leur publication sur la plateforme.
                </p>
              </section>

              <Separator />

              <section>
                <h2 className="text-xl font-semibold mb-3">8. Contact</h2>
                <p className="text-muted-foreground">
                  Pour toute question concernant ces CGU, contactez-nous à :{" "}
                  <a href="mailto:contact@mydietchef.com" className="text-primary hover:underline">
                    contact@mydietchef.com
                  </a>
                </p>
              </section>
            </CardContent>
          </Card>
        </div>
      </div>
    </HomeLayout>
  );
}
