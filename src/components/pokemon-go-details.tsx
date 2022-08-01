'use client';
import { useState } from 'react';
import { TypeBadge } from './type-badge';
import type { GoSpecies } from '@/lib/pokemon-go-model';
export function PokemonGoDetails({ species }: { species: GoSpecies }) {
  const [selected, setSelected] = useState(species.forms[0].form);
  const form =
    species.forms.find((f) => f.form === selected) || species.forms[0];
  return (
    <>
      <div className="go-statuses">
        <span>
          {species.released
            ? 'Species release recorded'
            : 'Species release unconfirmed'}
        </span>
        <span>
          {species.shiny
            ? 'Species shiny recorded'
            : 'Species shiny unconfirmed'}
        </span>
      </div>
      <p className="go-note">
        Release and shiny records are species-level. They do not confirm every
        form or current encounter availability.
      </p>
      <div className="go-form-heading">
        <label>
          GO form
          <select
            value={selected}
            onChange={(event) => setSelected(event.target.value)}
          >
            {species.forms.map((f) => (
              <option value={f.form} key={f.form}>
                {f.form.replaceAll('_', ' ')}
              </option>
            ))}
          </select>
        </label>
        <div className="types">
          {form.types.map((t) => (
            <TypeBadge key={t} type={t} />
          ))}
        </div>
      </div>
      <dl className="go-stats">
        <div>
          <dt>Base Attack</dt>
          <dd>{form.attack}</dd>
        </div>
        <div>
          <dt>Base Defense</dt>
          <dd>{form.defense}</dd>
        </div>
        <div>
          <dt>Base Stamina</dt>
          <dd>{form.stamina}</dd>
        </div>
        <div>
          <dt>Buddy distance</dt>
          <dd>
            {form.buddyDistance === null
              ? 'Not listed'
              : `${form.buddyDistance} km / candy`}
          </dd>
        </div>
        <div>
          <dt>Evolution candy</dt>
          <dd>
            {form.candyCosts?.length
              ? form.candyCosts.join(' / ')
              : 'Not listed'}
          </dd>
        </div>
      </dl>
      <p className="go-note">
        Candy costs alone do not include items, tasks, or other evolution
        requirements. These are GO base stats, not IVs or main-series stats.
      </p>
      <div className="go-moves">
        {[
          {
            label: 'Fast moves',
            moves: form.moves?.fast_moves,
            elite: form.moves?.elite_fast_moves,
          },
          {
            label: 'Charged moves',
            moves: form.moves?.charged_moves,
            elite: form.moves?.elite_charged_moves,
          },
        ].map((group) => (
          <section key={group.label}>
            <h3>{group.label}</h3>
            {group.moves ? (
              <ul>
                {group.moves.map((move) => (
                  <li key={move}>{move}</li>
                ))}
                {group.elite?.map((move) => (
                  <li key={`elite-${move}`}>
                    {move}
                    <span className="elite-badge">Elite / legacy</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="go-note">Move data is unavailable for this form.</p>
            )}
          </section>
        ))}
      </div>
    </>
  );
}
