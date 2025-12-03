/**
 * Moroccan banks configuration
 */

export interface Bank {
  code: string;
  name: string;
  logo: string;
}

export const BANKS: Bank[] = [
  {
    code: "CIH",
    name: "CIH Bank",
    logo: "/banks/cih.png",
  },
  {
    code: "ATTIJARI",
    name: "Attijariwafa Bank",
    logo: "/banks/attijari.png",
  },
  {
    code: "BP",
    name: "Banque Populaire",
    logo: "/banks/bp.png",
  },
  {
    code: "BMCE",
    name: "Bank of Africa (BMCE)",
    logo: "/banks/bmce.png",
  },
  {
    code: "SG",
    name: "Société Générale Maroc",
    logo: "/banks/sg.png",
  },
  {
    code: "CAM",
    name: "Crédit Agricole Maroc",
    logo: "/banks/cam.png",
  },
  {
    code: "ABB",
    name: "Al Barid Bank",
    logo: "/banks/abb.png",
  },
];

/**
 * Get bank by code
 */
export function getBankByCode(code: string): Bank | undefined {
  return BANKS.find((bank) => bank.code === code);
}

