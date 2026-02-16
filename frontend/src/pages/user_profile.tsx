import { gql } from "@apollo/client";
import { useMutation, useQuery } from "@apollo/client/react";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import Link from "next/link";
import { useState } from "react";
import HomeLayout from "@/components/HomeLayout";

dayjs.extend(customParseFormat);

const USER_PROFILE_QUERY = gql`
  query UserProfileData {
    userProfileData {
      firstName
      lastName
      dateOfBirth
      gender
      height
      currentWeight
      goal
      medicalTags
    }
  }
`;

const UPDATE_USER_PROFILE_MUTATION = gql`
  mutation UpdateUserProfileData($data: UserProfileUpdateInput!) {
    updateUserProfileData(data: $data) {
      firstName
      lastName
      dateOfBirth
      gender
      height
      currentWeight
      goal
      medicalTags
    }
  }
`;

type UserProfilePayload = {
  firstName: string;
  lastName: string;
  dateOfBirth?: string | null;
  gender?: string | null;
  height?: number | null;
  currentWeight?: number | null;
  goal?: string | null;
  medicalTags: string[];
};

type UserProfileQueryData = {
  userProfileData: UserProfilePayload | null;
};

type UpdateUserProfileMutationData = {
  updateUserProfileData: UserProfilePayload | null;
};

type UpdateUserProfileMutationVariables = {
  data: {
    firstName: string;
    lastName: string;
    dateOfBirth?: string;
    gender?: string;
    height?: number;
    currentWeight?: number;
    goal?: string;
    medicalTags: string[];
  };
};

type UserProfileDraft = {
  firstName?: string;
  lastName?: string;
  birthDay?: number;
  birthMonth?: number;
  birthYear?: number;
  heightInput?: string;
  weightInput?: string;
  goal?: string;
  gender?: "homme" | "femme";
  medicalTags?: string[];
};

const navItems = [
  { label: "Mon Dashboard", active: false, href: "/dashboard_user" },
  { label: "Mon profil", active: true },
  { label: "Mes repas", active: false, href: "/repas_utilisateur" },
  { label: "Mon évolution", active: false, href: "/evolution_user" },
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

function parseDate(dateText?: string | null): { day: number; month: number; year: number } {
  if (!dateText) {
    return { day: 12, month: 6, year: 1984 };
  }
  const parsedDate = dayjs(dateText, "YYYY-MM-DD", true);
  if (!parsedDate.isValid()) {
    return { day: 12, month: 6, year: 1984 };
  }
  return {
    day: parsedDate.date(),
    month: parsedDate.month() + 1,
    year: parsedDate.year(),
  };
}

function toNumber(value: string): number | undefined {
  const parsed = Number(value.replace(",", ".").trim());
  return Number.isFinite(parsed) ? parsed : undefined;
}

function normalizeGender(gender?: string | null): "homme" | "femme" {
  return gender?.toLowerCase() === "homme" ? "homme" : "femme";
}

export default function UserProfilePage() {
  const { data, loading, error } = useQuery<UserProfileQueryData>(USER_PROFILE_QUERY, {
    fetchPolicy: "cache-and-network",
  });

  const [updateProfile, { loading: isSaving, error: saveError }] = useMutation<
    UpdateUserProfileMutationData,
    UpdateUserProfileMutationVariables
  >(UPDATE_USER_PROFILE_MUTATION);

  const profile = data?.userProfileData;
  const parsedBirthDate = parseDate(profile?.dateOfBirth);
  const [draft, setDraft] = useState<UserProfileDraft>({});
  const [medicalInfoInput, setMedicalInfoInput] = useState("");
  const [saveFeedback, setSaveFeedback] = useState("");

  const firstName = draft.firstName ?? profile?.firstName ?? "Jane";
  const lastName = draft.lastName ?? profile?.lastName ?? "Doe";
  const birthDay = draft.birthDay ?? parsedBirthDate.day;
  const birthMonth = draft.birthMonth ?? parsedBirthDate.month;
  const birthYear = draft.birthYear ?? parsedBirthDate.year;
  const heightInput =
    draft.heightInput ??
    (profile?.height !== null && profile?.height !== undefined ? String(profile.height) : "");
  const weightInput =
    draft.weightInput ??
    (profile?.currentWeight !== null && profile?.currentWeight !== undefined
      ? String(profile.currentWeight)
      : "");
  const goal = draft.goal ?? profile?.goal ?? "";
  const gender = draft.gender ?? normalizeGender(profile?.gender);
  const medicalTags = draft.medicalTags ?? profile?.medicalTags ?? [];
  const selectedBirthDate = dayjs(`${birthYear}-${birthMonth}-${birthDay}`, "YYYY-M-D", true);

  const formattedBirthDate = selectedBirthDate.isValid()
    ? selectedBirthDate.format("DD/MM/YYYY")
    : "";
  const profileName = firstName.trim() || "Utilisateur";

  const handleAddMedicalTag = () => {
    const nextTag = medicalInfoInput.trim();
    if (!nextTag) {
      return;
    }

    setDraft((previousDraft) => {
      const currentTags = previousDraft.medicalTags ?? profile?.medicalTags ?? [];
      if (currentTags.includes(nextTag)) {
        return previousDraft;
      }
      return { ...previousDraft, medicalTags: [...currentTags, nextTag] };
    });
    setMedicalInfoInput("");
  };

  const handleRemoveMedicalTag = (tagToRemove: string) => {
    setDraft((previousDraft) => {
      const currentTags = previousDraft.medicalTags ?? profile?.medicalTags ?? [];
      return { ...previousDraft, medicalTags: currentTags.filter((tag) => tag !== tagToRemove) };
    });
  };

  const handleSave = async () => {
    setSaveFeedback("");

    const height = toNumber(heightInput);
    const currentWeight = toNumber(weightInput);

    try {
      await updateProfile({
        variables: {
          data: {
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            dateOfBirth: selectedBirthDate.isValid()
              ? selectedBirthDate.format("YYYY-MM-DD")
              : undefined,
            gender,
            height,
            currentWeight,
            goal: goal.trim(),
            medicalTags,
          },
        },
      });
      setSaveFeedback("Profil enregistré.");
    } catch (_e) {
      setSaveFeedback("Erreur pendant l'enregistrement.");
    }
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
                {loading && (
                  <div className="rounded-md bg-[#eef4e8] px-3 py-2 text-xs text-[#3c3c3c]">
                    Chargement de votre profil...
                  </div>
                )}

                {error && (
                  <div className="rounded-md bg-[#f7e1e1] px-3 py-2 text-xs text-[#7b2222]">
                    Donnees indisponibles. Verifie que vous etes bien connecte(e).
                  </div>
                )}

                <div className="max-w-3xl text-[#2c2c2c]">
                  <h1 className="text-lg font-semibold">Modifier son profil :</h1>
                  <p className="mt-1 text-xs text-[#576057]">
                    {profileName}, ces infos servent a personnaliser votre parcours sante avec votre
                    coach.
                  </p>
                </div>

                <div className="mt-6 space-y-6">
                  <section className="rounded-md border border-[#d3d8cf] bg-[#eef4e8] p-4 md:p-5">
                    <h2 className="text-sm font-semibold text-[#2e3a2d]">Identite</h2>
                    <div className="mt-4 grid gap-4 md:grid-cols-2">
                      <label className="text-xs text-[#4b5a4b]" htmlFor="firstName">
                        Prenom
                        <input
                          id="firstName"
                          type="text"
                          value={firstName}
                          onChange={(event) =>
                            setDraft((previousDraft) => ({
                              ...previousDraft,
                              firstName: event.target.value,
                            }))
                          }
                          className="mt-1 w-full rounded-md border border-[#bdbdbd] bg-white px-3 py-2 text-sm text-[#2c2c2c] shadow-[inset_0_1px_2px_rgba(0,0,0,0.08)] focus:outline-none focus:ring-2 focus:ring-[#9bb59a]"
                        />
                      </label>
                      <label className="text-xs text-[#4b5a4b]" htmlFor="lastName">
                        Nom de famille
                        <input
                          id="lastName"
                          type="text"
                          value={lastName}
                          onChange={(event) =>
                            setDraft((previousDraft) => ({
                              ...previousDraft,
                              lastName: event.target.value,
                            }))
                          }
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
                            onChange={(event) =>
                              setDraft((previousDraft) => ({
                                ...previousDraft,
                                birthDay: Number(event.target.value),
                              }))
                            }
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
                            onChange={(event) =>
                              setDraft((previousDraft) => ({
                                ...previousDraft,
                                birthMonth: Number(event.target.value),
                              }))
                            }
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
                            onChange={(event) =>
                              setDraft((previousDraft) => ({
                                ...previousDraft,
                                birthYear: Number(event.target.value),
                              }))
                            }
                            className="h-9 rounded-md border border-[#bdbdbd] bg-white px-2 text-xs text-[#2c2c2c] shadow-[inset_0_1px_2px_rgba(0,0,0,0.06)]"
                          >
                            {yearOptions.map((year) => (
                              <option key={year} value={year}>
                                {year}
                              </option>
                            ))}
                          </select>
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
                            value={heightInput}
                            onChange={(event) =>
                              setDraft((previousDraft) => ({
                                ...previousDraft,
                                heightInput: event.target.value,
                              }))
                            }
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
                            value={weightInput}
                            onChange={(event) =>
                              setDraft((previousDraft) => ({
                                ...previousDraft,
                                weightInput: event.target.value,
                              }))
                            }
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
                        But a atteindre
                        <textarea
                          id="goal"
                          value={goal}
                          onChange={(event) =>
                            setDraft((previousDraft) => ({
                              ...previousDraft,
                              goal: event.target.value,
                            }))
                          }
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
                          placeholder="Ajouter une information medicale"
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
                              x
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
                            checked={gender === "homme"}
                            onChange={() =>
                              setDraft((previousDraft) => ({ ...previousDraft, gender: "homme" }))
                            }
                            className="accent-[#7a9378]"
                          />
                          Homme
                        </label>
                        <label className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="gender"
                            checked={gender === "femme"}
                            onChange={() =>
                              setDraft((previousDraft) => ({ ...previousDraft, gender: "femme" }))
                            }
                            className="accent-[#7a9378]"
                          />
                          Femme
                        </label>
                      </div>
                    </div>
                  </section>
                </div>

                <div className="mt-6 flex items-center justify-end gap-3">
                  {saveFeedback && <p className="text-xs text-[#2f5c2f]">{saveFeedback}</p>}
                  {saveError && (
                    <p className="text-xs text-[#7b2222]">Erreur: {saveError.message}</p>
                  )}
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={isSaving}
                    className="rounded-md bg-[#2f3d2f] px-6 py-2 text-xs font-semibold text-white shadow-[0_3px_6px_rgba(0,0,0,0.25)] disabled:opacity-60"
                  >
                    {isSaving ? "Enregistrement..." : "Enregistrer"}
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
