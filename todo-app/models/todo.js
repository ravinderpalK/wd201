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
    static addTodo({ title, dueDate, completed }) {
      return this.create({
        title: title,
        dueDate: dueDate,
        completed: completed,
      });
    }
    setCompletionStatus(status) {
      return this.update({ completed: !status });
    }

    static async remove(id) {
      return this.destroy({
        where: {
          id,
        },
      });
    }

    static getTodos() {
      return this.findAll();
    }

    static getCompletedTodos() {
      return this.findAll({
        where: {
          completed: true,
        },
      });
    }

    static getOverdueTodos() {
      const { Op } = require("sequelize");
      return this.findAll({
        where: {
          dueDate: {
            [Op.lt]: new Date().toISOString().slice(0, 10),
          },
          completed: false,
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
          completed: false,
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
          completed: false,
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
