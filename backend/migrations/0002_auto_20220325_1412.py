# Generated by Django 3.1.6 on 2022-03-25 20:12

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('backend', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='comment',
            name='published',
            field=models.DateTimeField(default='2022-03-25T20:12:27+00:00', editable=False),
        ),
        migrations.AlterField(
            model_name='post',
            name='published',
            field=models.DateTimeField(default='2022-03-25T20:12:27+00:00', editable=False),
        ),
    ]
