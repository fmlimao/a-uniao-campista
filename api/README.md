# Migration

Para criar a model e migration

    npx sequelize-cli model:generate --name User --attributes firstName:string,lastName:string,email:string

No arquivo da model, adicionar essas options:

    {
        timestamps: true,
        paranoid: true,
    }

E no arquivo da migration, adicionar esse campo:

    deletedAt: {
        allowNull: true,
        type: Sequelize.DATE
    }

Para executar a migration:

    npx sequelize-cli db:migrate

E para o rollback

    npx sequelize-cli db:migrate:undo:all
