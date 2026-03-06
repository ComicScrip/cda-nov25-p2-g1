import HomeLayout from "@/components/HomeLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function MentionsLegalesPage() {
  return (
    <HomeLayout pageTitle="Mentions légales">
      <div className="flex-1 bg-light-bg py-8 md:py-12 px-4 md:px-6">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl md:text-3xl">Mentions légales</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <p className="text-sm text-muted-foreground mb-4">
                  Dernière mise à jour : {new Date().toLocaleDateString("fr-FR")}
                </p>
              </div>

              <Separator />

              <section>
                <h2 className="text-xl font-semibold mb-3">1. Éditeur du site</h2>
                <div className="text-muted-foreground space-y-2">
                  <p>
                    <strong>Raison sociale :</strong> MyDietChef
                  </p>
                  <p>
                    <strong>Forme juridique :</strong> Société par Actions Simplifiée (SAS)
                  </p>
                  <p>
                    <strong>Capital social :</strong> [À compléter]
                  </p>
                  <p>
                    <strong>Siège social :</strong> [Adresse complète à compléter]
                  </p>
                  <p>
                    <strong>SIRET :</strong> [Numéro SIRET à compléter]
                  </p>
                  <p>
                    <strong>RCS :</strong> [Ville du RCS à compléter]
                  </p>
                </div>
              </section>

              <Separator />

              <section>
                <h2 className="text-xl font-semibold mb-3">2. Directeur de publication</h2>
                <p className="text-muted-foreground">
                  <strong>Directeur de publication :</strong> [Nom du directeur à compléter]
                </p>
              </section>

              <Separator />

              <section>
                <h2 className="text-xl font-semibold mb-3">3. Hébergement</h2>
                <div className="text-muted-foreground space-y-2">
                  <p>
                    <strong>Hébergeur :</strong> [Nom de l'hébergeur à compléter]
                  </p>
                  <p>
                    <strong>Adresse :</strong> [Adresse de l'hébergeur à compléter]
                  </p>
                  <p>
                    <strong>Téléphone :</strong> [Numéro de téléphone à compléter]
                  </p>
                </div>
              </section>

              <Separator />

              <section>
                <h2 className="text-xl font-semibold mb-3">4. Contact</h2>
                <div className="text-muted-foreground space-y-2">
                  <p>
                    <strong>Email :</strong>{" "}
                    <a
                      href="mailto:contact@mydietchef.com"
                      className="text-primary hover:underline"
                    >
                      contact@mydietchef.com
                    </a>
                  </p>
                  <p>
                    <strong>Téléphone :</strong> [Numéro de téléphone à compléter]
                  </p>
                </div>
              </section>

              <Separator />

              <section>
                <h2 className="text-xl font-semibold mb-3">5. Propriété intellectuelle</h2>
                <p className="text-muted-foreground mb-4">
                  L'ensemble des éléments du site MyDietChef (textes, images, vidéos, logos, icônes,
                  sons, logiciels) sont la propriété exclusive de MyDietChef, sauf mention
                  contraire. Toute reproduction, représentation, modification, publication,
                  adaptation de tout ou partie des éléments du site, quel que soit le moyen ou le
                  procédé utilisé, est interdite sans autorisation écrite préalable de MyDietChef.
                </p>
              </section>

              <Separator />

              <section>
                <h2 className="text-xl font-semibold mb-3">6. Protection des données</h2>
                <p className="text-muted-foreground mb-4">
                  Conformément à la loi "Informatique et Libertés" et au RGPD, vous disposez d'un
                  droit d'accès, de rectification, de suppression et d'opposition aux données
                  personnelles vous concernant. Pour plus d'informations, consultez notre{" "}
                  <a href="/confidentialite" className="text-primary hover:underline">
                    politique de confidentialité
                  </a>{" "}
                  et notre{" "}
                  <a href="/rgpd" className="text-primary hover:underline">
                    page RGPD
                  </a>
                  .
                </p>
              </section>

              <Separator />

              <section>
                <h2 className="text-xl font-semibold mb-3">7. Cookies</h2>
                <p className="text-muted-foreground mb-4">
                  Le site utilise des cookies pour améliorer votre expérience de navigation. En
                  continuant à utiliser le site, vous acceptez l'utilisation de cookies. Pour plus
                  d'informations, consultez notre{" "}
                  <a href="/confidentialite" className="text-primary hover:underline">
                    politique de confidentialité
                  </a>
                  .
                </p>
              </section>

              <Separator />

              <section>
                <h2 className="text-xl font-semibold mb-3">8. Limitation de responsabilité</h2>
                <p className="text-muted-foreground mb-4">
                  MyDietChef s'efforce d'assurer l'exactitude et la mise à jour des informations
                  diffusées sur le site. Cependant, MyDietChef ne peut garantir l'exactitude, la
                  précision ou l'exhaustivité des informations mises à disposition sur le site. En
                  conséquence, MyDietChef décline toute responsabilité pour toute imprécision,
                  inexactitude ou omission portant sur des informations disponibles sur le site.
                </p>
              </section>

              <Separator />

              <section>
                <h2 className="text-xl font-semibold mb-3">9. Droit applicable</h2>
                <p className="text-muted-foreground">
                  Les présentes mentions légales sont régies par le droit français. En cas de
                  litige, les tribunaux français seront seuls compétents.
                </p>
              </section>
            </CardContent>
          </Card>
        </div>
      </div>
    </HomeLayout>
  );
}
