export interface ChildPreferences {
  childName: string;
  childGender: "boy" | "girl";
  childAge: number;
  archetype: string;
  world: string;
  moral: string;
}

export interface StoryPage {
  page_number: number;
  story_text: string;
  image_prompt: string;
}

export interface StoryBook {
  title: string;
  pages: StoryPage[];
}

export interface ArchetypeOption {
  id: string;
  label: string;
  description: string;
  icon: string;
  promptTemplate: string;
}

export interface WorldOption {
  id: string;
  label: string;
  description: string;
  icon: string;
  promptTemplate: string;
}

export interface MoralOption {
  id: string;
  label: string;
  description: string;
  icon: string;
}
