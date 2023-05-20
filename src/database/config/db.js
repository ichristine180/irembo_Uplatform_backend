import dotenv from "dotenv";
import Sequelize from 'sequelize';
import config from './config.js';

dotenv.config()
const env = process.env.NODE_ENV || 'development';
const sequelizeConfig = config[env];
const sequelize = new Sequelize(sequelizeConfig.database, sequelizeConfig.username, sequelizeConfig.password, {
  host: sequelizeConfig.host,
  dialect: sequelizeConfig.dialect,
  logging: false
});

export default sequelize;