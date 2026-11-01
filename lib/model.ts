export const kinds = ['projects','hackathons','achievements','certifications','education','leadership','timeline','experience','research','publications','awards','gallery','dsa','skills'] as const;
export type Kind = typeof kinds[number];
export type Entry = { id:string; kind:string; title:string; description:string; detail?:string; problem?:string; solution?:string; contribution?:string; architecture?:string; challenges?:string; learnings?:string; technologies?:string[]; features?:string[]; github?:string; demo?:string; verification?:string; organization?:string; role?:string; date?:string; period?:string; status:'draft'|'published'|'unpublished'; order:number; images?:string[]; certificate?:string; category?:string; featured?:boolean; updatedAt?:string; };
export type Profile = { name:string; titles:string; intro:string; bio:string; location:string; email:string; cgpa:string; image?:string; aboutImage?:string; resume?:string; resumePublished:boolean; socials:Record<string,string>; learning:{title:string;status:string}[]; };
export type Settings = { profile:Profile; sections:Record<string,boolean>; labels:Record<string,string>; web3formsKey?:string; };
export type Content = {settings:Settings; entries:Entry[]};
const initial={
  "settings": {
    "profile": {
      "name": "Your Name",
      "titles": "Software Developer",
      "intro": "Building useful software.",
      "bio": "Add your professional biography in the admin dashboard.",
      "location": "Your location",
      "email": "hello@example.com",
      "cgpa": "",
      "resumePublished": false,
      "socials": {},
      "learning": []
    },
    "sections": {
      "hackathons": false,
      "achievements": false,
      "certifications": false,
      "timeline": false,
      "experience": false,
      "research": false,
      "publications": false,
      "awards": false,
      "gallery": false,
      "dsa": true,
      "skills": true,
      "learning": true
    },
    "labels": {}
  },
  "entries": []
};
export const seedSettings:Settings=initial.settings;
export const seedEntries:Entry[]=initial.entries as Entry[];
export function visible(content:Content,kind:string){return content.settings.sections[kind]!==false?content.entries.filter(e=>e.kind===kind&&e.status==='published'&&e.title.trim()).sort((a,b)=>a.order-b.order):[]}
export function publicContent(content:Content):Content{const settings=structuredClone(content.settings);delete settings.web3formsKey;return {settings,entries:content.entries.filter(e=>e.status==='published'&&settings.sections[e.kind]!==false)}}
export function mediaReferences(value:unknown):string[]{const found=new Set<string>();const walk=(v:unknown)=>{if(typeof v==='string'){const m=v.match(/^\/api\/media\/([a-zA-Z0-9-]+)$/);if(m)found.add(m[1]);}else if(Array.isArray(v))v.forEach(walk);else if(v&&typeof v==='object')Object.values(v).forEach(walk)};walk(value);return [...found]}
