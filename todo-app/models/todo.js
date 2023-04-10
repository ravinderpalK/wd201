"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Todo extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
    static addTodo({ title, dueDate }) {
      return this.create({ title: title, dueDate: dueDate, completed: false });
    }
    markAsCompleted() {
      return this.update({ completed: true });
    }

    static getTodos() {
      return this.findAll();
    }

    static getOverdueTodos() {
      const { Op } = require("sequelize");
      return this.findAll({
        where: {
          dueDate: {
            [Op.lt]: new Date().toISOString().slice(0, 10),
          },
        },
      });
    }
    static getDueTodayTodos() {
      const { Op } = require("sequelize");
      return this.findAll({
        where: {
          dueDate: {
            [Op.eq]: new Date().toISOString().slice(0, 10),
          },
        },
      });
    }
    static getDueLaterTodos() {
      const { Op } = require("sequelize");
      return this.findAll({
        where: {
          dueDate: {
            [Op.gt]: new Date().toISOString().slice(0, 10),
          },
        },
      });
    }
  }
  Todo.init(
    {
      title: DataTypes.STRING,
      dueDate: DataTypes.DATEONLY,
      completed: DataTypes.BOOLEAN,
    },
    {
      sequelize,
      modelName: "Todo",
    }
  );
  return Todo;
};
