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
      Todo.belongsTo(models.User, {
        foreignKey: "userId",
      });
    }
    static addTodo({ title, dueDate, userId }) {
      return this.create({
        title: title,
        dueDate: dueDate,
        completed: false,
        userId,
      });
    }
    setCompletionStatus(status) {
      return this.update({ completed: !status });
    }

    static async remove(id, userId) {
      return this.destroy({
        where: {
          id,
          userId,
        },
      });
    }

    static getTodos() {
      return this.findAll();
    }

    static getCompletedTodos(userId) {
      return this.findAll({
        where: {
          completed: true,
          userId,
        },
      });
    }

    static getOverdueTodos(userId) {
      const { Op } = require("sequelize");
      return this.findAll({
        where: {
          dueDate: {
            [Op.lt]: new Date().toISOString().slice(0, 10),
          },
          userId,
          completed: false,
        },
      });
    }
    static getDueTodayTodos(userId) {
      const { Op } = require("sequelize");
      return this.findAll({
        where: {
          dueDate: {
            [Op.eq]: new Date().toISOString().slice(0, 10),
          },
          userId,
          completed: false,
        },
      });
    }
    static getDueLaterTodos(userId) {
      const { Op } = require("sequelize");
      return this.findAll({
        where: {
          dueDate: {
            [Op.gt]: new Date().toISOString().slice(0, 10),
          },
          userId,
          completed: false,
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
        },
      },
      dueDate: {
        type: DataTypes.DATEONLY,
        validate: {
          isDate: true,
        },
      },
      completed: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      sequelize,
      modelName: "Todo",
    }
  );
  return Todo;
};
