# Generated by Django 3.1.6 on 2022-02-24 20:11

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0002_auto_20220224_1310'),
    ]

    operations = [
        migrations.AlterField(
            model_name='nodeuser',
            name='host',
            field=models.CharField(editable=False, max_length=255),
        ),
        migrations.AlterField(
            model_name='nodeuser',
            name='url',
            field=models.URLField(editable=False),
        ),
    ]