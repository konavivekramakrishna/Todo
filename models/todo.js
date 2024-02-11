"use strict";
const { Model, Op } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Todo extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Todo.belongsTo(models.User, {
        foreignKey: "userId",
      });
    }

    setCompletionStatus(params) {
      return this.update({ completed: !params });
    }

    static allTodos() {
      return this.findAll();
    }

    static overdue(userId) {
      return this.findAll({
        where: {
          [Op.and]: {
            dueDate: { [Op.lt]: new Date() },
            completed: { [Op.not]: true },
          },
          userId: userId,
        },
      });
    }

    static todaydue(userId) {
      return this.findAll({
        where: {
          [Op.and]: {
            dueDate: { [Op.eq]: new Date() },
            completed: { [Op.not]: true },
          },
          userId: userId,
        },
      });
    }

    static laterdue(userId) {
      return this.findAll({
        where: {
          [Op.and]: {
            dueDate: { [Op.gt]: new Date() },
            completed: { [Op.not]: true },
          },
          userId: userId,
        },
      });
    }

    static completedtodos(userId) {
      return this.findAll({
        where: {
          completed: true,
          userId: userId,
        },
      });
    }

    static async addTodo(params, userid) {
      return await Todo.create({
        title: params.title,
        dueDate: params.dueDate,
        completed: params.completed,
        userId: userid,
      });
    }

    static async deleteTodo(params, userId) {
      return await Todo.destroy({
        where: {
          id: params,
          userId: userId,
        },
      });
    }
  }
  Todo.init(
    {
      title: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: true,
          len: 5,
        },
      },
      dueDate: DataTypes.DATEONLY,
      completed: DataTypes.BOOLEAN,
    },
    {
      sequelize,
      modelName: "Todo",
    },
  );
  return Todo;
};
