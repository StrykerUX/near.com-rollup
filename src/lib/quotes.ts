/**
 * The social-proof marquee. Logos are the real coloured marks, extracted out of
 * the original single-file build's data URIs into /public/logos.
 */
export type Quote = {
  text: string;
  person: string;
  /** '' when the org label alone is the attribution */
  role: string;
  org: string;
  logo: string;
};

export const QUOTES: Quote[] = [
  { text: 'An insanely good product.',                    person: 'Dan Smith',        role: '',           org: 'Blockworks Research', logo: '/logos/blockworks.png' },
  { text: 'The future of crypto.',                        person: 'Charles Hoskinson', role: '',           org: 'Cardano',             logo: '/logos/cardano.svg' },
  { text: 'What crypto is all about.',                    person: 'Christian Thompson', role: '',          org: 'Sui Foundation',      logo: '/logos/sui.svg' },
  { text: 'This is the way. Privacy first.',              person: 'Tyler Winklevoss', role: 'Co-Founder', org: 'Gemini',              logo: '/logos/gemini.png' },
  { text: 'The best way to be onchain and in control.',   person: 'David Hoffman',    role: '',           org: 'Bankless',            logo: '/logos/bankless.png' },
];
