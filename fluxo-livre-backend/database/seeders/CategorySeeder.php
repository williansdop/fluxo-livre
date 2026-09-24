<?php


namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            [
                'title'        => 'Calçada Inadequada',
                'slug'        => 'pavement_issue',
                'icon'        => 'alert-triangle',
                'description' => 'Buracos, guia quebrada ou piso tátil interrompido.',
            ],
            [
                'title'        => 'Rampa Ausente ou Danificada',
                'slug'        => 'ramp_issue',
                'icon'        => 'accessibility',
                'description' => 'Falta de rebaixamento de calçada ou rampa inacessível.',
            ],
            [
                'title'        => 'Bloqueio de Passagem',
                'slug'        => 'obstacle_blocking',
                'icon'        => 'barrier',
                'description' => 'Entulho, postes, lixo ou vegetação obstruindo a calçada.',
            ],
            [
                'title'        => 'Estacionamento Irregular',
                'slug'        => 'improper_parking',
                'icon'        => 'car-off',
                'description' => 'Veículos estacionados sobre a calçada ou rampa.',
            ],
            [
                'title'        => 'Semáforo ou Sinalização',
                'slug'        => 'traffic_light_issue',
                'icon'        => 'volume-x',
                'description' => 'Semáforo sonoro quebrado ou tempo de travessia insuficiente.',
            ],
            [
                'title'        => 'Apenas Escadas (Sem Acesso)',
                'slug'        => 'stairs_only',
                'icon'        => 'stairs',
                'description' => 'Locais sem alternativa de rampa ou elevador.',
            ],
            [
                'title'       => 'Outro',
                'slug'        => 'other',
                'icon'        => 'help-circle',
                'description' => 'Outros problemas de acessibilidade não listados nas categorias anteriores.',
            ]
        ];

        foreach ($categories as $category) {
            Category::firstOrCreate(['slug' => $category['slug']], $category);
        }
    }
}