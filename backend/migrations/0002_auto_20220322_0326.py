# Generated by Django 3.1.6 on 2022-03-22 09:26

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('backend', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='comment',
            name='published',
            field=models.DateTimeField(default='2022-03-22T09:26:44+00:00', editable=False),
        ),
        migrations.AlterField(
            model_name='post',
            name='published',
            field=models.DateTimeField(default='2022-03-22T09:26:44+00:00', editable=False),
        ),
    ]