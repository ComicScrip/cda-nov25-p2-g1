import HomeLayout from "@/components/HomeLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function RGPDPage() {
  return (
    <HomeLayout pageTitle="RGPD - Protection des données">
      <div className="flex-1 bg-light-bg py-8 md:py-12 px-4 md:px-6">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl md:text-3xl">
                RGPD - Protection des données personnelles
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
                <h2 className="text-xl font-semibold mb-3">Conformité RGPD</h2>
                <p className="text-muted-foreground mb-4">
                  MyDietChef est conforme au Règlement Général sur la Protection des Données (RGPD)
                  entré en vigueur le 25 mai 2018. Nous nous engageons à respecter vos droits et à
                  protéger vos données personnelles.
                </p>
              </section>

              <Separator />

              <section>
                <h2 className="text-xl font-semibold mb-3">Responsable du traitement</h2>
                <p className="text-muted-foreground mb-4">
                  Le responsable du traitement des données est MyDietChef. Pour toute question
                  concernant le traitement de vos données, vous pouvez nous contacter à :{" "}
                  <a href="mailto:dpo@mydietchef.com" className="text-primary hover:underline">
                    dpo@mydietchef.com
                  </a>
                </p>
              </section>

              <Separator />

              <section>
                <h2 className="text-xl font-semibold mb-3">Base légale du traitement</h2>
                <p className="text-muted-foreground mb-4">
                  Le traitement de vos données personnelles est basé sur :
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li>Votre consentement explicite</li>
                  <li>L'exécution d'un contrat (utilisation du service)</li>
                  <li>Notre intérêt légitime (amélioration du service)</li>
                  <li>Le respect d'obligations légales</li>
                </ul>
              </section>

              <Separator />

              <section>
                <h2 className="text-xl font-semibold mb-3">Durée de conservation</h2>
                <p className="text-muted-foreground mb-4">
                  Vos données sont conservées pendant la durée nécessaire aux finalités pour
                  lesquelles elles ont été collectées, et conformément aux obligations légales. Les
                  données sont supprimées automatiquement à la fermeture de votre compte, sauf
                  obligation légale de conservation.
                </p>
              </section>

              <Separator />

              <section>
                <h2 className="text-xl font-semibold mb-3">Vos droits RGPD</h2>
                <p className="text-muted-foreground mb-4">
                  Conformément au RGPD, vous disposez des droits suivants :
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li>
                    <strong>Droit d'accès :</strong> Vous pouvez demander une copie de vos données
                    personnelles
                  </li>
                  <li>
                    <strong>Droit de rectification :</strong> Vous pouvez corriger vos données
                    inexactes
                  </li>
                  <li>
                    <strong>Droit à l'effacement :</strong> Vous pouvez demander la suppression de
                    vos données
                  </li>
                  <li>
                    <strong>Droit à la limitation :</strong> Vous pouvez demander la limitation du
                    traitement
                  </li>
                  <li>
                    <strong>Droit à la portabilité :</strong> Vous pouvez récupérer vos données dans
                    un format structuré
                  </li>
                  <li>
                    <strong>Droit d'opposition :</strong> Vous pouvez vous opposer au traitement de
                    vos données
                  </li>
                  <li>
                    <strong>Droit de retrait du consentement :</strong> Vous pouvez retirer votre
                    consentement à tout moment
                  </li>
                </ul>
              </section>

              <Separator />

              <section>
                <h2 className="text-xl font-semibold mb-3">Exercer vos droits</h2>
                <p className="text-muted-foreground mb-4">Pour exercer vos droits, vous pouvez :</p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li>
                    Nous contacter par email à{" "}
                    <a href="mailto:dpo@mydietchef.com" className="text-primary hover:underline">
                      dpo@mydietchef.com
                    </a>
                  </li>
                  <li>Utiliser les paramètres de votre compte pour modifier certaines données</li>
                  <li>
                    Introduire une réclamation auprès de la CNIL si vous estimez que vos droits ne
                    sont pas respectés
                  </li>
                </ul>
              </section>

              <Separator />

              <section>
                <h2 className="text-xl font-semibold mb-3">Transfert de données</h2>
                <p className="text-muted-foreground mb-4">
                  Vos données sont stockées et traitées au sein de l'Union Européenne. En cas de
                  transfert vers un pays tiers, nous nous assurons que des garanties appropriées
                  sont en place conformément au RGPD.
                </p>
              </section>

              <Separator />

              <section>
                <h2 className="text-xl font-semibold mb-3">Contact DPO</h2>
                <p className="text-muted-foreground">
                  Pour toute question concernant la protection de vos données, contactez notre
                  Délégué à la Protection des Données (DPO) à :{" "}
                  <a href="mailto:dpo@mydietchef.com" className="text-primary hover:underline">
                    dpo@mydietchef.com
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
