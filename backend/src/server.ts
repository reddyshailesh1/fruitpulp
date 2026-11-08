import app from './app';
import { env } from './config/env';
import { connectDB } from './db/connection';
import { getOrCreateCampaign } from './services/campaign.service';

async function bootstrap() {
  try {
    console.log('🍊 Starting Orange Pulp Juice Point Game Server...');
    await connectDB();

    // Ensure active campaign and randomized box arrangement are initialized
    const campaign = await getOrCreateCampaign(env.CAMPAIGN_ID);
    console.log(`🎉 Active campaign loaded: "${campaign.name}" [ID: ${campaign.campaignId}]`);

    const server = app.listen(env.PORT, () => {
      console.log(`🚀 Server running on http://localhost:${env.PORT}`);
      console.log(`🍹 Health check available at http://localhost:${env.PORT}/api/health`);
    });

    const shutdown = async () => {
      console.log('\n🛑 Gracefully shutting down Orange Pulp server...');
      server.close(() => {
        console.log('✅ HTTP server closed.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
  } catch (error) {
    console.error('❌ Failed to bootstrap server:', error);
    process.exit(1);
  }
}

bootstrap();
