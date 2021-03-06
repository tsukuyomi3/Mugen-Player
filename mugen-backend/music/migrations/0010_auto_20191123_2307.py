# Generated by Django 2.2.7 on 2019-11-23 17:37

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('music', '0009_auto_20191123_0700'),
    ]

    operations = [
        migrations.AlterField(
            model_name='album',
            name='album_logo',
            field=models.ImageField(default='default.png', max_length=500, upload_to='images/'),
        ),
        migrations.AlterField(
            model_name='artist',
            name='artist_logo',
            field=models.ImageField(default='default.png', max_length=500, upload_to='images/'),
        ),
        migrations.AlterField(
            model_name='song',
            name='audio',
            field=models.FileField(max_length=500, upload_to='audio/'),
        ),
    ]
