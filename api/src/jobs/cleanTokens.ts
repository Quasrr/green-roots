import { prisma } from '../models/index.ts';

async function cleanExpiredTokens() {
    try {
        const result = await prisma.refreshToken.deleteMany({
            where: {
                expiresAt: {
                    lt: new Date()
                }
            }
        });

        if (result.count > 0) {
            console.log(`[CleanJob] ${result.count} refresh token(s) expirés supprimés`);
        };

    } catch (error) {
        console.error('[CleanJob] Erreur lors du nettoyage des tokens expirés :', error);
    };
};

const TWENTY_FOUR_HOURS = 1000 * 60 * 60 * 24;

export function startCleanExpiredTokensJob() {
    cleanExpiredTokens();
    setInterval(cleanExpiredTokens, TWENTY_FOUR_HOURS);
    console.log('[CleanJob] Job de nettoyage des tokens expirés démarré');
};