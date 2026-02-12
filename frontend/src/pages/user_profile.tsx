import Link from "next/link";
import { useState } from "react";
import HomeLayout from "@/components/HomeLayout";

const navItems = [
  { label: "Mon Dashboard", active: false, href: "/dashboard_user" },
  { label: "Mon profil", active: true },
  { label: "Mes repas", active: false, href: "/repas_utilisateur" },
  { label: "Mon évolution", active: false, href: "/evolution_user" },
];

const initialMedicalTags = [
  "Allergie gluten",
  "Thrombose",
  "Anxiété",
  "Hypertension",
  "Pose anneau gastrique",
];
const dayOptions = Array.from({ length: 31 }, (_, index) => index + 1);
const monthOptions = [
  { value: 1, label: "Jan" },
  { value: 2, label: "Fév" },
  { value: 3, label: "Mar" },
  { value: 4, label: "Avr" },
  { value: 5, label: "Mai" },
  { value: 6, label: "Juin" },
  { value: 7, label: "Juil" },
  { value: 8, label: "Aoû" },
  { value: 9, label: "Sep" },
  { value: 10, label: "Oct" },
  { value: 11, label: "Nov" },
  { value: 12, label: "Déc" },
];
const currentYear = new Date().getFullYear();
const yearOptions = Array.from({ length: 120 }, (_, index) => currentYear - index);

export default function UserProfilePage() {
  const [birthDay, setBirthDay] = useState(12);
  const [birthMonth, setBirthMonth] = useState(6);
  const [birthYear, setBirthYear] = useState(1984);
  const [medicalTags, setMedicalTags] = useState(initialMedicalTags);
  const [medicalInfoInput, setMedicalInfoInput] = useState("");

  const formattedBirthDate = `${String(birthDay).padStart(2, "0")}/${String(birthMonth).padStart(2, "0")}/${birthYear}`;

  const handleAddMedicalTag = () => {
    const nextTag = medicalInfoInput.trim();
    if (!nextTag) {
      return;
    }

    setMedicalTags((previousTags) =>
      previousTags.includes(nextTag) ? previousTags : [...previousTags, nextTag],
    );
    setMedicalInfoInput("");
  };

  const handleRemoveMedicalTag = (tagToRemove: string) => {
    setMedicalTags((previousTags) => previousTags.filter((tag) => tag !== tagToRemove));
  };

  return (
    <HomeLayout pageTitle="Profil">
      <section className="flex-1 bg-[#f3f7ee] py-6">
        <div className="mx-auto w-full max-w-5xl px-4">
          <div className="overflow-hidden rounded-md border border-[#c9c9c9] bg-white shadow-[0_2px_6px_rgba(0,0,0,0.12)]">
            <div className="grid grid-cols-1 md:grid-cols-[200px_1fr]">
              <aside className="border-r border-[#c1c1c1] bg-[#e2e5e0]">
                <nav className="p-4">
                  <ul className="space-y-3 text-sm text-[#3c3c3c]">
                    {navItems.map((item) => (
                      <li key={item.label}>
                        {item.href ? (
                          <Link
                            href={item.href}
                            className={`block w-full rounded-sm py-2 text-center shadow-[0_2px_4px_rgba(0,0,0,0.16)] ${
                              item.active
                                ? "bg-[#7a9378] text-white"
                                : "bg-[#f1f1f1] text-[#3c3c3c]"
                            }`}
                          >
                            {item.label}
                          </Link>
                        ) : (
                          <button
                            type="button"
                            className={`w-full rounded-sm py-2 shadow-[0_2px_4px_rgba(0,0,0,0.16)] ${
                              item.active
                                ? "bg-[#7a9378] text-white"
                                : "bg-[#f1f1f1] text-[#3c3c3c]"
                            }`}
                          >
                            {item.label}
                          </button>
                        )}
                      </li>
                    ))}
                  </ul>
                </nav>
              </aside>

              <div className="bg-[#f5fbf1] px-5 py-6 md:px-8">
                <div className="max-w-3xl text-[#2c2c2c]">
                  <h1 className="text-lg font-semibold">Modifier son profil :</h1>
                  <p className="mt-1 text-xs text-[#576057]">
                    Anthony, ces infos serviront à améliorer l&apos;expérience de ton parcours santé
                    avec ton coach personnel.
                  </p>
                </div>

                <div className="mt-6 space-y-6">
                  <section className="rounded-md border border-[#d3d8cf] bg-[#eef4e8] p-4 md:p-5">
                    <h2 className="text-sm font-semibold text-[#2e3a2d]">Identité</h2>
                    <div className="mt-4 grid gap-4 md:grid-cols-2">
                      <label className="text-xs text-[#4b5a4b]" htmlFor="firstName">
                        Prénom
                        <input
                          id="firstName"
                          type="text"
                          defaultValue="Anthony"
                          className="mt-1 w-full rounded-md border border-[#bdbdbd] bg-white px-3 py-2 text-sm text-[#2c2c2c] shadow-[inset_0_1px_2px_rgba(0,0,0,0.08)] focus:outline-none focus:ring-2 focus:ring-[#9bb59a]"
                        />
                      </label>
                      <label className="text-xs text-[#4b5a4b]" htmlFor="lastName">
                        Nom de famille
                        <input
                          id="lastName"
                          type="text"
                          defaultValue="Dilassienne"
                          className="mt-1 w-full rounded-md border border-[#bdbdbd] bg-white px-3 py-2 text-sm text-[#2c2c2c] shadow-[inset_0_1px_2px_rgba(0,0,0,0.08)] focus:outline-none focus:ring-2 focus:ring-[#9bb59a]"
                        />
                      </label>
                      <label className="text-xs text-[#4b5a4b] md:col-span-2" htmlFor="birthDate">
                        Date de naissance
                        <div className="mt-1 flex flex-wrap items-center gap-2">
                          <input
                            id="birthDate"
                            type="text"
                            value={formattedBirthDate}
                            readOnly
                            tabIndex={-1}
                            aria-readonly="true"
                            className="pointer-events-none min-w-[160px] flex-1 select-none rounded-md border border-[#bdbdbd] bg-[#f7f7f7] px-3 py-2 text-sm text-[#2c2c2c] shadow-[inset_0_1px_2px_rgba(0,0,0,0.08)]"
                          />
                          <select
                            value={birthDay}
                            onChange={(event) => setBirthDay(Number(event.target.value))}
                            className="h-9 rounded-md border border-[#bdbdbd] bg-white px-2 text-xs text-[#2c2c2c] shadow-[inset_0_1px_2px_rgba(0,0,0,0.06)]"
                          >
                            {dayOptions.map((day) => (
                              <option key={day} value={day}>
                                {day}
                              </option>
                            ))}
                          </select>
                          <select
                            value={birthMonth}
                            onChange={(event) => setBirthMonth(Number(event.target.value))}
                            className="h-9 rounded-md border border-[#bdbdbd] bg-white px-2 text-xs text-[#2c2c2c] shadow-[inset_0_1px_2px_rgba(0,0,0,0.06)]"
                          >
                            {monthOptions.map((month) => (
                              <option key={month.value} value={month.value}>
                                {month.label}
                              </option>
                            ))}
                          </select>
                          <select
                            value={birthYear}
                            onChange={(event) => setBirthYear(Number(event.target.value))}
                            className="h-9 rounded-md border border-[#bdbdbd] bg-white px-2 text-xs text-[#2c2c2c] shadow-[inset_0_1px_2px_rgba(0,0,0,0.06)]"
                          >
                            {yearOptions.map((year) => (
                              <option key={year} value={year}>
                                {year}
                              </option>
                            ))}
                          </select>
                          <button
                            type="button"
                            className="flex h-9 w-9 items-center justify-center rounded-md border border-[#bdbdbd] bg-white text-[#2c2c2c] shadow-[0_1px_2px_rgba(0,0,0,0.08)]"
                            aria-label="Ouvrir le calendrier"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="h-4 w-4"
                            >
                              <title>Calendrier</title>
                              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                              <line x1="16" y1="2" x2="16" y2="6" />
                              <line x1="8" y1="2" x2="8" y2="6" />
                              <line x1="3" y1="10" x2="21" y2="10" />
                            </svg>
                          </button>
                        </div>
                      </label>
                    </div>
                  </section>

                  <section className="rounded-md border border-[#d3d8cf] bg-[#eef4e8] p-4 md:p-5">
                    <h2 className="text-sm font-semibold text-[#2e3a2d]">Mensuration</h2>
                    <div className="mt-4 grid gap-4 md:grid-cols-2">
                      <label className="text-xs text-[#4b5a4b]" htmlFor="height">
                        Taille
                        <div className="mt-1 flex items-center rounded-md border border-[#bdbdbd] bg-white shadow-[inset_0_1px_2px_rgba(0,0,0,0.08)]">
                          <input
                            id="height"
                            type="text"
                            defaultValue="1m70"
                            className="w-full rounded-l-md bg-transparent px-3 py-2 text-sm text-[#2c2c2c] focus:outline-none"
                          />
                          <span className="px-3 text-xs text-[#4b5a4b]">Cm</span>
                        </div>
                      </label>
                      <label className="text-xs text-[#4b5a4b]" htmlFor="weight">
                        Poids actuel
                        <div className="mt-1 flex items-center rounded-md border border-[#bdbdbd] bg-white shadow-[inset_0_1px_2px_rgba(0,0,0,0.08)]">
                          <input
                            id="weight"
                            type="text"
                            defaultValue="80"
                            className="w-full rounded-l-md bg-transparent px-3 py-2 text-sm text-[#2c2c2c] focus:outline-none"
                          />
                          <span className="px-3 text-xs text-[#4b5a4b]">Kg</span>
                        </div>
                      </label>
                    </div>
                  </section>

                  <section className="rounded-md border border-[#d3d8cf] bg-[#eef4e8] p-4 md:p-5">
                    <h2 className="text-sm font-semibold text-[#2e3a2d]">Objectif</h2>
                    <div className="mt-4 space-y-4">
                      <label className="text-xs text-[#4b5a4b]" htmlFor="goal">
                        But à atteindre
                        <textarea
                          id="goal"
                          defaultValue="Me sentir mieux dans mon corps, manger sainement et équilibré. Le tout accompagné par un professionnel pour me motiver."
                          className="mt-1 min-h-[110px] w-full resize-none rounded-md border border-[#bdbdbd] bg-white px-3 py-2 text-sm text-[#2c2c2c] shadow-[inset_0_1px_2px_rgba(0,0,0,0.08)] focus:outline-none focus:ring-2 focus:ring-[#9bb59a]"
                        />
                      </label>

                      <form
                        className="flex flex-col gap-2 sm:flex-row sm:items-center"
                        onSubmit={(event) => {
                          event.preventDefault();
                          handleAddMedicalTag();
                        }}
                      >
                        <input
                          type="text"
                          placeholder="Ajouter une information médicale"
                          value={medicalInfoInput}
                          onChange={(event) => setMedicalInfoInput(event.target.value)}
                          className="flex-1 rounded-md border border-[#bdbdbd] bg-white px-3 py-2 text-sm text-[#2c2c2c] shadow-[inset_0_1px_2px_rgba(0,0,0,0.08)] focus:outline-none focus:ring-2 focus:ring-[#9bb59a]"
                        />
                        <button
                          type="submit"
                          className="rounded-md bg-[#7a9378] px-6 py-2 text-xs font-semibold text-white shadow-[0_2px_4px_rgba(0,0,0,0.2)]"
                        >
                          Ajouter
                        </button>
                      </form>

                      <div className="flex flex-wrap gap-2">
                        {medicalTags.map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex items-center gap-2 rounded-full border border-[#9aa29b] bg-white px-3 py-1 text-[11px] text-[#3d4a3d] shadow-[0_1px_2px_rgba(0,0,0,0.08)]"
                          >
                            {tag}
                            <button
                              type="button"
                              onClick={() => handleRemoveMedicalTag(tag)}
                              aria-label={`Supprimer ${tag}`}
                              className="inline-flex h-3 w-3 items-center justify-center rounded-full border border-[#6a746a] text-[8px]"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>

                      <div className="flex flex-wrap items-center gap-6 text-xs text-[#4b5a4b]">
                        <span>Sexe</span>
                        <label className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="gender"
                            defaultChecked
                            className="accent-[#7a9378]"
                          />
                          Homme
                        </label>
                        <label className="flex items-center gap-2">
                          <input type="radio" name="gender" className="accent-[#7a9378]" />
                          Femme
                        </label>
                      </div>
                    </div>
                  </section>
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    type="button"
                    className="rounded-md bg-[#2f3d2f] px-6 py-2 text-xs font-semibold text-white shadow-[0_3px_6px_rgba(0,0,0,0.25)]"
                  >
                    Enregistrer
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </HomeLayout>
  );
}
