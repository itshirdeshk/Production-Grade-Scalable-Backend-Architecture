import { ApiKeyModel, Permission } from '../models/apiKeyModel';
import Logger from '../core/Logger';
import crypto from 'crypto';
import mongoose from 'mongoose';
import { dbConnection } from './index';

/**
 * Generates a random API key string
 * @returns A random string to use as API key
 */
const generateApiKeyString = (): string => {
  // Generate a 32-byte random string and convert to hex
  return crypto.randomBytes(32).toString('hex');
};

/**
 * Seeds a sample API key to the database
 * @returns The created API key document
 */
const seedApiKey = async () => {
  try {
    // Check if database is connected
    if (dbConnection.readyState !== 1) {
      Logger.info('Database not connected. Connecting now...');
      await new Promise<void>((resolve) => {
        if (dbConnection.readyState === 1) resolve();
        dbConnection.once('connected', resolve);
      });
    }

    Logger.info('Seeding API key...');

    // Check if we already have an API key
    const existingKey = await ApiKeyModel.findOne();
    
    if (existingKey) {
      Logger.info('API key already exists in database');
      return existingKey;
    }

    // Create new API key
    const apiKey = {
      key: generateApiKeyString(),
      version: 1,
      permissions: [Permission.GENERAL],
      status: true
    };

    // Save to database
    const createdApiKey = await ApiKeyModel.create(apiKey);
    
    Logger.info('API Key seeded successfully');
    Logger.debug(`API Key: ${createdApiKey.key}`);
    
    return createdApiKey;
  } catch (error) {
    Logger.error('Error seeding API key:');
    Logger.error(error);
    throw error;
  }
};

export default seedApiKey;

// For direct execution from command line
if (require.main === module) {
  seedApiKey()
    .then((apiKey) => {
      Logger.info('API Key seeding completed');
      process.exit(0);
    })
    .catch((error) => {
      Logger.error('API Key seeding failed');
      process.exit(1);
    });
}
