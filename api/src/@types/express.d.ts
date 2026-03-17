
import type { User } from "../prisma/generated/client.ts";

declare global { //on dit à TypeScript qu'on modifie un type global (accessible partout)
   
    namespace Express {  //on cible spécifiquement les types d'Express
        interface Request {//on étend l'interface Request existante d'Express (on ne la remplace pas, on y ajoute)
            user?: User; //on ajoute la propriété user
        }
    }
}

export { };