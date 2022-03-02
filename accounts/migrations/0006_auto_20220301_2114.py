# Generated by Django 3.1.6 on 2022-03-02 04:14

import uuid

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0005_auto_20220301_1941'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='post',
            options={},
        ),
        migrations.AddField(
            model_name='post',
            name='published',
            field=models.DateTimeField(default='2022-03-02T04:14:42+00:00'),
        ),
        migrations.AlterField(
            model_name='like',
            name='uuid',
            field=models.UUIDField(default=uuid.UUID('2e9554fa-be61-41f5-b368-9b6591607af0'), primary_key=True, serialize=False),
        ),
    ]
