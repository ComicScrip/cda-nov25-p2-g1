import HomeLayout from "@/components/HomeLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function ConfidentialitePage() {
  return (
    <HomeLayout pageTitle="Politique de confidentialité">
      <div className="flex-1 bg-light-bg py-8 md:py-12 px-4 md:px-6">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl md:text-3xl">Politique de confidentialité</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <p className="text-sm text-muted-foreground mb-4">
                  Dernière mise à jour : {new Date().toLocaleDateString("fr-FR")}
                </p>
              </div>

              <Separator />

              <section>
                <h2 className="text-xl font-semibold mb-3">1. Introduction</h2>
                <p className="text-muted-foreground mb-4">
                  MyDietChef s'engage à protéger la confidentialité de vos données personnelles.
                  Cette politique de confidentialité explique comment nous collectons, utilisons et
                  protégeons vos informations lorsque vous utilisez notre plateforme.
                </p>
              </section>

              <Separator />

              <section>
                <h2 className="text-xl font-semibold mb-3">2. Données collectées</h2>
                <p className="text-muted-foreground mb-4">
                  Nous collectons les données suivantes :
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li>Informations d'identification (nom, prénom, email)</li>
                  <li>Données de profil (âge, poids, taille, objectifs)</li>
                  <li>Données nutritionnelles (repas, recettes, analyses)</li>
                  <li>Données de connexion (adresse IP, cookies)</li>
                </ul>
              </section>

              <Separator />

              <section>
                <h2 className="text-xl font-semibold mb-3">3. Utilisation des données</h2>
                <p className="text-muted-foreground mb-4">Vos données sont utilisées pour :</p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li>Fournir et améliorer nos services</li>
                  <li>Personnaliser votre expérience utilisateur</li>
                  <li>Analyser vos habitudes nutritionnelles</li>
                  <li>Vous contacter concernant votre compte</li>
                </ul>
              </section>

              <Separator />

              <section>
                <h2 className="text-xl font-semibold mb-3">4. Partage des données</h2>
                <p className="text-muted-foreground mb-4">
                  Nous ne vendons pas vos données personnelles. Nous pouvons partager vos
                  informations uniquement dans les cas suivants :
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li>Avec votre consentement explicite</li>
                  <li>Avec votre coach assigné (si applicable)</li>
                  <li>Pour respecter une obligation légale</li>
                  <li>Avec nos prestataires de services (sous contrat strict)</li>
                </ul>
              </section>

              <Separator />

              <section>
                <h2 className="text-xl font-semibold mb-3">5. Sécurité des données</h2>
                <p className="text-muted-foreground mb-4">
                  Nous mettons en œuvre des mesures de sécurité techniques et organisationnelles
                  appropriées pour protéger vos données contre tout accès non autorisé, perte ou
                  destruction.
                </p>
              </section>

              <Separator />

              <section>
                <h2 className="text-xl font-semibold mb-3">6. Vos droits</h2>
                <p className="text-muted-foreground mb-4">
                  Conformément au RGPD, vous disposez des droits suivants :
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li>Droit d'accès à vos données</li>
                  <li>Droit de rectification</li>
                  <li>Droit à l'effacement</li>
                  <li>Droit à la portabilité</li>
                  <li>Droit d'opposition</li>
                </ul>
              </section>

              <Separator />

              <section>
                <h2 className="text-xl font-semibold mb-3">7. Contact</h2>
                <p className="text-muted-foreground">
                  Pour toute question concernant cette politique de confidentialité, vous pouvez
                  nous contacter à :{" "}
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
