# Generated by Django 2.2.7 on 2019-11-23 01:30

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('music', '0008_auto_20191123_0653'),
    ]

    operations = [
        migrations.AlterField(
            model_name='album',
            name='album_logo',
            field=models.ImageField(default='default.png', max_length=500, upload_to=''),
        ),
    ]
