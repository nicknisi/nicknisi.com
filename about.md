---
layout: prose
---

<section>
  <div class="flex items-center flex-col">
    <img alt="Nick Nisi" class="rounded-full w-64 h-64" src="/img/profile.jpg" >
    <h1>Nick Nisi</h1>
  </div>
</section>

I'm a Staff Software Engineer, coding professionally since 2009 and focused primarily on the front end and
JavaScript/TypeScript. I am a big fan of community involvement, and have been involved in local meetups since the start.
I have also been involved in the behind the scenes organization of several conferences, and helmed a couple, including
TypeScript Conf US and the Nebraska JavaScript conference.

Outside of tech, I am a dad to two amazing kids. I'm also an avid karaoke enthusiast. My go-to songs include _Kiss_ by
Prince and _How am I Supposed to Live Without You_ by Michael Bolton. I am also an ordained Jedi Knight who has
presided over nine weddings.

## Talks

Nick is an occasional conference speaker and has spoken at conferences all over the world.

<div class="flex flex-wrap place-content-evenly">
  {%- for talk in talks %}
    {%- if talk.promote %}
      <div class="md:flex-1 xs:flex-grow rounded-lg shadow-lg shadow-blue-gray-300 bg-cool-gray-50 p-2 space-x-2 space-y-2 m-2 w-89">
        <a href="{{talk.url | url}}" target="_blank" class="no-underline">
          <div class="flex flex-col items-center justify-items-center p-4">
            <h5 class="text-grey-900 text-xl leading-tight font-bold h-8">{{talk.title}}</h5>
            <img class="rounded w-48 mx-2" src="https://img.youtube.com/vi/{{talk.video_id}}/hqdefault.jpg" alt="{{talk.title}}">
            <div class="flex flex-col align-content-center justify-content-center">
              <div class="text-grey-600">{{talk.date}}</div>
              <div class="text-grey-600 text-l leading-tight font-medium">{{talk.location}}</div>
            </div>
          </div>
        </a>
      </div>
    {%- endif %}
  {%- endfor %}
</div>

**[Full List of talks](/talks)**

## Projects

<div class="flex place-content-evenly flex-wrap">
{%- for project in metadata.projects %}
  <div class="flex flex-col align-center justify-center rounded-lg shadow-lg shadow-blue-gray-300 bg-cool-gray-50 place-content-evenly p-2 space-x-2 space-y-2 m-2">
    <a href="{{project.url | url}}" target="_blank" class="no-underline">
      <div class="flex">
        <div class="flex justify-items-center align-items-center place-content-evenly">
          <img alt="JS Party" class="rounded w-16 h-16 mx-2" src="{{project.avatar | url}}" >
          <div clas="flex flex-col w-64">
            <h5 class="text-gray-900 text-xl leading-tight font-medium">{{project.title}}</h5>
            <p class="text-gray-700 text-sm mb-2 p-2 w-64">{{project.description}}</p>
          </div>
        </div>
      </div>
      <div class="flex place-content-baseline">
        <span class="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full uppercase
        last text-teal-700 bg-teal-200 last:mr-0 mr-1">
          {{project.role}}
        </span>
        {%- if project.status === "inactive" %}
        <span class="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full uppercase
        last text-red-700 bg-red-200 last:mr-0 mr-1">
          {{project.status}}
        </span>
        {%- endif %}
      </div>
      </a>
  </div>
{%- endfor %}
</div>

## Bio

> Nick Nisi is a software developer specializing in JavaSript, TypeScript, and the web. He has contributed to multiple open source projects, including [dojo](https://dojo.io), [intern](https://intern.io), and [TypeDoc](http://typedoc.org). He is also a panelist on [JS Party](https://changelog.com/jsparty) and formerly on [TalkScript](https://talkscript.fm). He is also an organizer and Emcee of the [Nebraska JavaScript Conference](https://nejsconf.com) and [TypeScript Conf](https://tsconf.io).
